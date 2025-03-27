import google_auth_oauthlib.flow
import jwt
import requests
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect


def google_login(request):
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file("client_secret.json", scopes=["email", "profile"])
    flow.redirect_uri = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI
    authorization_url, state = flow.authorization_url(access_type="offline", include_granted_scopes="true")
    return redirect(authorization_url)


def google_login_redirect(request):
    code = request.GET.get("code")
    data = {
        "code": code,
        "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
        "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
        "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    response = requests.post(settings.SOCIAL_AUTH_GOOGLE_OAUTH2_TOKEN_URL, data=data)

    decoded_data = {}
    if id_token := response.json().get("id_token"):
        decoded_data = jwt.decode(id_token, options={"verify_signature": False})
    return JsonResponse(decoded_data)
