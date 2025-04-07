from datetime import datetime, timezone

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_401_UNAUTHORIZED
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
        response = Response(status=HTTP_204_NO_CONTENT)
        response.delete_cookie("id_token")
        return response
