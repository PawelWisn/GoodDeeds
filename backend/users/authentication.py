import jwt
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class GoogleIDTokenCookieAuthentication(BaseAuthentication):
    def authenticate(self, request):
        id_token = request.COOKIES.get("id_token")
        if not id_token:
            return None

        try:
            token_data = jwt.decode(id_token, options={"verify_signature": False})
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("ID token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid ID token")

        sub = token_data.get("sub")
        if not sub:
            raise AuthenticationFailed("Invalid ID token: missing 'sub' field")

        request.auth_token_data = token_data
        user, created = get_user_model().objects.get_or_create(sub=sub)
        return (user, None)

    def authenticate_header(self, request):
        return 'Cookie realm="api" cookie-name="id_token"'
