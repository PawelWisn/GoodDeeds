import json
from logging import getLogger

from channels.generic.websocket import AsyncWebsocketConsumer

logger = getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("NotificationConsumer - connecting...")

        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        logger.info(f"NotificationConsumer - connected to group [{self.group_name}]")

    async def disconnect(self, close_code):
        logger.info(f"NotificationConsumer - disconnecting...")

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        logger.info(f"NotificationConsumer - disconnected from group [{self.group_name}] [{close_code}]")

    async def receive(self, text_data):
        pass

    async def send_notification(self, event):
        logger.info("NotificationConsumer - sending notification...")

        await self.send(text_data=json.dumps(event["data"]))

        logger.info(f"NotificationConsumer - sent notification: {event['data']}")
