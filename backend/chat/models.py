import uuid
from datetime import datetime

from chat.managers import ChatRoomManager
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)
    created_at = models.DateTimeField(default=datetime.now)
    created_by = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="created_chat_rooms")
    members = models.ManyToManyField("users.User", related_name="chat_rooms", blank=True)
    private_room = models.BooleanField(default=False)

    objects = ChatRoomManager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def can_delete(self, user: User) -> bool:
        return self.created_by == user
