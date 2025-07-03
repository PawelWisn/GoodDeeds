import json
from logging import getLogger

from channels.generic.websocket import AsyncWebsocketConsumer

logger = getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("ChatConsumer - connecting...")

        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_room_{self.room_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        logger.info(f"ChatConsumer - connected to room [{self.room_group_name}]")

    async def disconnect(self, close_code):
        logger.info(f"ChatConsumer - disconnecting...")

        disconnect_message = {
            "type": "broadcast.share_data",
            "key": None,
            "ownerUUID": "",
        }

        await self.channel_layer.group_send(self.room_group_name, disconnect_message)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        logger.info(f"ChatConsumer - disconnected from room [{self.room_group_name}] [{close_code}]")

    async def receive(self, text_data):
        logger.info("ChatConsumer - receiving...")

        data = json.loads(text_data)

        if data["type"] == "share_data":
            data["type"] = "broadcast.share_data"
        elif data["type"] == "message":
            data["type"] = "broadcast.message"
        elif data["type"] == "share_data_demand":
            data["type"] = "demand.share_data"
        else:
            raise ValueError(f"Invalid message type")

        await self.channel_layer.group_send(self.room_group_name, data)

        logger.info(f"ChatConsumer - received [{data['type']}] from [{data['ownerUUID']}]")

    async def broadcast_message(self, event):
        logger.info("ChatConsumer - broadcasting message...")

        event["type"] = "message"
        await self.send(text_data=json.dumps(event))

        logger.info(f"ChatConsumer - broadcasted message from [{event['ownerUUID']}]")

    async def broadcast_share_data(self, event):
        logger.info("ChatConsumer - broadcasting user data...")

        event["type"] = "share_data"
        await self.send(text_data=json.dumps(event))

        logger.info(f"ChatConsumer - broadcasted user data of [{event['ownerUUID']}]")

    async def demand_share_data(self, event):
        logger.info("ChatConsumer - demanding user data...")
        event["type"] = "share_data_demand"

        await self.send(text_data=json.dumps(event))
        logger.info(f"ChatConsumer - demanded user data from [{event['ownerUUID']}]")

    async def share_data(self, event):
        await self.broadcast_share_data(event)

    async def share_data_demand(self, event):
        await self.demand_share_data(event)
