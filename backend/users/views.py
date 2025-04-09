from datetime import datetime, timezone

import requests
from chat.models import ChatRoom
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED, HTTP_404_NOT_FOUND
from rest_framework.views import APIView


class SetCSRFTokenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return Response({"csrftoken": csrf_token})


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get("id_token")

        if not id_token:
            return Response({"error": "Missing id_token"}, status=HTTP_400_BAD_REQUEST)

        response = requests.get(f"{settings.GOOGLE_OAUTH2_TOKEN_INFO_URI}?id_token={id_token}")
        if response.status_code != HTTP_200_OK:
            return Response({"error": "Invalid token"}, status=HTTP_401_UNAUTHORIZED)

        data = response.json()

        user, _ = get_user_model().objects.get_or_create(sub=data["sub"])

        max_age = int(data["exp"]) - int(datetime.now(timezone.utc).timestamp())
        response = Response(
            {
                "user_id": user.id,
                "user_name": data.get("name"),
                "user_avatar": data.get("picture"),
            }
        )
        response.set_cookie(
            key="id_token",
            value=id_token,
            httponly=True,
            samesite="Strict",
            max_age=max_age,
        )

        cache.set(
            f"user_{user.id}",
            {
                "id": user.id,
                "name": data.get("name"),
                "avatar": data.get("picture"),
            },
            timeout=max_age,
        )

        return response


class VerifyAuthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response(status=HTTP_204_NO_CONTENT)

        response = Response({"error": "Unauthorized"}, status=HTTP_401_UNAUTHORIZED)
        response.delete_cookie("id_token")
        return response


class AboutMeView(APIView):
    def get(self, request):
        data = {
            "user_id": request.user.id,
            "user_name": request.auth_token_data.get("name"),
            "user_avatar": request.auth_token_data.get("picture"),
        }
        return Response(data)


class LogoutView(APIView):
    def post(self, request):
        cache.delete(f"user_{request.user.id}")
        response = Response(status=HTTP_204_NO_CONTENT)
        response.delete_cookie("id_token")
        return response


class LoggedInUsersView(APIView):
    def get(self, request):
        my_key = f"user_{request.user.id}"
        user_keys = cache.keys("user_*")
        users = [cache.get(key) for key in user_keys if key != my_key]

        return Response(users, status=HTTP_200_OK)


class NotificationView(APIView):
    def get(self, request):
        key = f"notification_{request.user.id}"
        if notification_data := cache.get(key):
            cache.delete(key)
            return Response(notification_data, status=HTTP_200_OK)
        return Response({"notification": None, "room_id": None}, status=HTTP_200_OK)

    def post(self, request):
        room_id = request.data.get("room_id")
        if chat := ChatRoom.objects.filter(id=room_id).first():
            if recipient := chat.members.exclude(id=request.user.id).first():
                key = f"notification_{recipient.id}"
                user_name = request.auth_token_data.get("name") or "Someone"
                message = f"{user_name} wants to chat with you"
                notification_data = {"notification": message, "room_id": room_id, "room_name": chat.name}
                cache.set(key, notification_data, timeout=3600)
            return Response(status=HTTP_204_NO_CONTENT)
        return Response({"error": "Chat room not found"}, status=HTTP_404_NOT_FOUND)
