import uuid
from datetime import datetime

from chat.managers import ChatRoomManager
from django.db import models


class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=datetime.now)
    created_by = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="created_chat_rooms")
    members = models.ManyToManyField("users.User", related_name="chat_rooms", blank=True)

    objects = ChatRoomManager()

    def __str__(self):
        return self.name
