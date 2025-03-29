import json
from datetime import datetime, timezone

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token
from users.utils import decode_id_token, get_logout_response


def set_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({"csrftoken": csrf_token})


def google_login_react(request):
    if request.method == "POST":
        id_token = json.loads(request.body).get("id_token")

        if not id_token:
            return JsonResponse({"error": "Missing id_token"}, status=400)

        response = requests.get(f"{settings.GOOGLE_OAUTH2_TOKEN_INFO_URI}?id_token={id_token}")
        if response.status_code != 200:
            return JsonResponse({"error": "Invalid token"}, status=401)
        data = response.json()

        user, _ = get_user_model().objects.get_or_create(sub=data["sub"])

        max_age = int(data["exp"]) - int(datetime.now(timezone.utc).timestamp())
        response = JsonResponse({"user_id": user.id, "user_name": data["name"]})
        response.set_cookie(
            key="id_token",
            value=id_token,
            httponly=True,
            samesite="Strict",
            max_age=max_age,
        )
        return response

    return JsonResponse({}, status=204)


def verify_auth(request):
    if id_token := request.COOKIES.get("id_token"):
        if data := decode_id_token(id_token):
            return JsonResponse({}, status=204)
    return get_logout_response(status=401)


def logout_view(request):
    return get_logout_response()


def about_me(request):
    if id_token := request.COOKIES.get("id_token"):
        if data := decode_id_token(id_token):
            user = get_user_model().objects.get(sub=data["sub"])
            return JsonResponse({"user_id": user.id, "user_name": data["name"]})
    return get_logout_response(status=401)
