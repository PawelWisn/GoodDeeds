import jwt
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
