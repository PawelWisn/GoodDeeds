from functools import wraps

import jwt
from django.contrib.auth import get_user_model
from django.http import JsonResponse


def decode_id_token(id_token: str) -> dict | None:
    try:
        return jwt.decode(id_token, options={"verify_signature": False})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def get_logout_response(data=None, status=204):
    data = data or {}
    response = JsonResponse(data, status=status)
    response.delete_cookie("id_token")
    return response


def authenticate_user(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        id_token = request.COOKIES.get("id_token")
        if not id_token:
            return get_logout_response({"error": "No id token"}, 401)

        data = decode_id_token(id_token)
        if not data:
            return get_logout_response({"error": "Token invalid"}, 401)

        user = get_user_model().objects.filter(sub=data["sub"]).first()
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)

        request.user = user

        return view_func(request, *args, **kwargs)

    return wrapper
