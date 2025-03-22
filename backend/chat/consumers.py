import json
from logging import getLogger
from uuid import uuid4

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer

logger = getLogger(__name__)

room_group_name = f"chat_{uuid4()}"


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("ChatConsumer.connect, self.scope: %s" % self.scope)

        self.room_group_name = room_group_name

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        logger.info("ChatConsumer.disconnect: %s" % close_code)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        logger.info("ChatConsumer.receive: %s" % text_data)
        data = json.loads(text_data)

        if data["type"] == "public_key":
            data["type"] = "broadcast.public_key"
        elif data["type"] == "message":
            data["type"] = "chat.message"
        elif data["type"] == "public_key_demand":
            data["type"] = "demand.public_key"
        else:
            raise NotImplementedError("Invalid message type")

        await self.channel_layer.group_send(self.room_group_name, data)

    async def chat_message(self, event):
        logger.info("ChatConsumer.chat_message: %s" % event)
        event["type"] = "message"
        await self.send(text_data=json.dumps(event))

    async def broadcast_public_key(self, event):
        logger.info("ChatConsumer.broadcast_public_key: %s" % event)
        event["type"] = "public_key"
        await self.send(text_data=json.dumps(event))

    async def demand_public_key(self, event):
        logger.info("ChatConsumer.demand_public_key: %s" % event)
        event["type"] = "public_key_demand"
        await self.send(text_data=json.dumps(event))
