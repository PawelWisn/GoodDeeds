import json
from logging import getLogger
from uuid import uuid4

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer

logger = getLogger(__name__)

room_group_name = f"chat_{uuid4()}"


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = room_group_name

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        logger.info("ChatConsumer.connect - %s: %s" % (self.room_group_name, self.scope))
        await self.accept()

    async def disconnect(self, close_code):
        logger.info("ChatConsumer.disconnect - %s: %s" % (self.room_group_name, self.scope))
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        logger.info("ChatConsumer.receive - %s: %s" % (self.room_group_name, text_data))
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(self.room_group_name, {"type": "chat.message", "message": message})

    # Receive message from room group
    async def chat_message(self, event):
        logger.info("ChatConsumer.chat_message - %s: %s" % (self.room_group_name, event))
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type": "message", "message": message}))
