from chat.models import ChatRoom
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND, HTTP_409_CONFLICT
from rest_framework.views import APIView


class ChatRoomsListView(APIView):
    def get(self, request):
        available_rooms = ChatRoom.objects.available_to_user(request.user).filter(private_room=False).order_by("-created_at")
        response_data = [
            {
                "id": room.id,
                "name": room.name,
                "can_delete": room.can_delete(request.user),
            }
            for room in available_rooms
        ]
        return Response(response_data, status=HTTP_200_OK)

    def post(self, request):
        room_name = request.data.get("name")
        private_room = request.data.get("private_room", False)
        recipient_id = request.data.get("recipient_id")

        if (private_room and not recipient_id) or (not private_room and recipient_id):
            return Response({"error": "Invalid parameters"}, status=HTTP_400_BAD_REQUEST)

        if not room_name:
            return Response({"error": "Missing room name"}, status=HTTP_400_BAD_REQUEST)

        name_max_length = ChatRoom._meta.get_field("name").max_length
        if len(room_name) > name_max_length:
            return Response(
                {"error": f"Room name too long, only {name_max_length} characters are allowed"},
                status=HTTP_400_BAD_REQUEST,
            )

        chat = ChatRoom.objects.create(name=room_name, created_by=request.user, private_room=private_room)
        chat.members.add(request.user)
        if private_room and recipient_id:
            recipient_user = get_user_model().objects.filter(id=recipient_id).first()
            if not recipient_user:
                return Response({"error": "Recipient not found"}, status=HTTP_400_BAD_REQUEST)
            chat.members.add(recipient_user)

        return Response({"id": chat.id, "name": room_name}, status=HTTP_201_CREATED)


class ChatRoomDetailView(APIView):
    def delete(self, request, room_id):
        chat = ChatRoom.objects.filter(id=room_id).first()
        if not chat:
            return Response({"error": "Chat room not found"}, status=HTTP_404_NOT_FOUND)

        if not chat.can_delete(request.user):
            return Response({"error": "You are not allowed to delete this chat room"}, status=HTTP_403_FORBIDDEN)

        chat.delete()
        return Response(status=HTTP_204_NO_CONTENT)


class JoinChatRoomView(APIView):
    def post(self, request, room_id):
        chat = ChatRoom.objects.filter(id=room_id).first()
        if not chat:
            return Response({"error": "Chat room not found"}, status=HTTP_404_NOT_FOUND)

        if chat.members.filter(id=request.user.id).exists():
            return Response({"message": "User is already a member of this chat room"}, status=HTTP_200_OK)

        if chat.members.count() >= 2:
            return Response({"error": "Chat room already has two members"}, status=HTTP_403_FORBIDDEN)

        chat.members.add(request.user)
        return Response({"message": "User successfully added to the chat room"}, status=HTTP_200_OK)


class PrivateRoomCheckView(APIView):
    def get(self, request, recipient_id):
        private_room = ChatRoom.objects.filter(private_room=True, members__in=[request.user]).filter(members__in=[recipient_id]).first()
        if private_room:
            if cache.get(f"user_{recipient_id}"):
                return Response({"room_id": private_room.id, "room_name": private_room.name})
            return Response({"error": "User has logged out"}, status=HTTP_409_CONFLICT)
        return Response({"error": "No private room found"}, status=HTTP_404_NOT_FOUND)
