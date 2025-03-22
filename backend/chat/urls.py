from django.urls import re_path

from .consumers import ChatConsumer
from .views import index, room

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
]


urlpatterns = [
    re_path("^$", index, name="index"),
    re_path(r"^(?P<room_name>\w+)/$", room, name="room"),
]
