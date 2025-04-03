from chat.views import chat_room_detail, chat_rooms_list, join_chat_room
from django.urls import re_path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_id>[0-9a-fA-F-]{36})/$", ChatConsumer.as_asgi()),
]

urlpatterns = [
    re_path(r"^$", chat_rooms_list, name="chat_rooms_list"),
    re_path(r"^(?P<room_id>[0-9a-fA-F-]{36})/$", chat_room_detail, name="chat_room_detail"),
    re_path(r"^(?P<room_id>[0-9a-fA-F-]{36})/join/$", join_chat_room, name="join_chat_room"),
]
