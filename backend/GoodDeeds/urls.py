from chat.urls import urlpatterns as chat_urlpatterns
from django.urls import include, path
from users.urls import urlpatterns as users_urlpatterns

urlpatterns = [
    path("users/", include(users_urlpatterns)),
    path("chats/", include(chat_urlpatterns)),
]
