from django.urls import path
from users.views import google_login, google_login_redirect

urlpatterns = [
    path("google_login/", google_login, name="google_login"),
    path("google_login_redirect/", google_login_redirect, name="google_login_redirect"),
]
