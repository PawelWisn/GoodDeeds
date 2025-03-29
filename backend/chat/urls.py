from chat.views import chats_view
from django.urls import path, re_path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
]

urlpatterns = [
    path("", chats_view, name="chats"),
]
