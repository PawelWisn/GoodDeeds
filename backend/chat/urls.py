from chat.views import ChatRoomDetailView, ChatRoomsListView, JoinChatRoomView
from django.urls import re_path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_id>[0-9a-fA-F-]{36})/$", ChatConsumer.as_asgi()),
]

urlpatterns = [
    re_path(r"^$", ChatRoomsListView.as_view(), name="chat_rooms_list"),
    re_path(r"^(?P<room_id>[0-9a-fA-F-]{36})/$", ChatRoomDetailView.as_view(), name="chat_room_detail"),
    re_path(r"^(?P<room_id>[0-9a-fA-F-]{36})/join/$", JoinChatRoomView.as_view(), name="join_chat_room"),
]
