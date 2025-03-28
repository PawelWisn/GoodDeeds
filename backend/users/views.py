import json

import jwt
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token


def set_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})


def google_login_react(request):
    if request.method == "POST":
        id_token = json.loads(request.body).get("id_token")

        if not id_token:
            return JsonResponse({"error": "Missing id_token"}, status=400)

        try:
            response = requests.get(f"{settings.GOOGLE_OAUTH2_TOKEN_INFO_URI}?id_token={id_token}")
            if response.status_code != 200:
                return JsonResponse({"error": "Invalid token"}, status=401)

            sub = response.json()["sub"]

            user, _ = get_user_model().objects.get_or_create(sub=sub)

            response = JsonResponse({"user_id": user.id})
            response.set_cookie(key="id_token", value=id_token, httponly=True, samesite="Strict")
            return response

        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({})


def verify_auth(request):
    status = 401
    if id_token := request.COOKIES.get("id_token"):
        try:
            jwt.decode(id_token, options={"verify_signature": False})
        except:
            status = 401
        else:
            status = 204
    return JsonResponse({}, status=status)


def logout_view(request):
    response = JsonResponse({}, status=204)
    response.delete_cookie("id_token")
    return response
