from django.urls import path
from users.views import google_login_react, set_csrf_token, verify_auth

urlpatterns = [
    path("google_login_react/", google_login_react, name="google_login_react"),
    path("set_csrf_token/", set_csrf_token, name="set_csrf_token"),
    path("verify_auth/", verify_auth, name="verify_auth"),
]
