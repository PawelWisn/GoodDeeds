from django.urls import path
from users.views import AboutMeView, GoogleLoginView, LoggedInUsersView, LogoutView, NotificationView, SetCSRFTokenView, VerifyAuthView

urlpatterns = [
    path("google_login_react/", GoogleLoginView.as_view(), name="google_login_react"),
    path("set_csrf_token/", SetCSRFTokenView.as_view(), name="set_csrf_token"),
    path("verify_auth/", VerifyAuthView.as_view(), name="verify_auth"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("about_me/", AboutMeView.as_view(), name="about_me"),
    path("logged_in/", LoggedInUsersView.as_view(), name="logged_in_users"),
    path("notifications/", NotificationView.as_view(), name="notifications"),
]
