import json

from chat.models import ChatRoom
from django.http import JsonResponse
from users.utils import authenticate_user


@authenticate_user
def chat_rooms_list(request):
    if request.method == "POST":
        data = json.loads(request.body)
        room_name = data.get("name")

        if not room_name:
            return JsonResponse({"error": "Missing room name"}, status=400)
        name_max_length = ChatRoom._meta.get_field("name").max_length
        if len(room_name) > name_max_length:
            return JsonResponse({"error": f"Room name too long, Only {name_max_length} characters are allowed"}, status=400)

        chat = ChatRoom.objects.create(name=room_name, created_by=request.user)
        chat.members.add(request.user)

        return JsonResponse({"id": chat.id, "name": room_name}, status=201)

    if request.method == "GET":
        available_rooms = ChatRoom.objects.available_to_user(request.user).order_by("-created_at")
        response_data = [
            {
                "id": room.id,
                "name": room.name,
                "own_room": room.created_by == request.user,
                "can_delete": room.can_delete(request.user),
            }
            for room in available_rooms
        ]
        return JsonResponse(response_data, status=200, safe=False)

    return JsonResponse({}, status=405)


@authenticate_user
def chat_room_detail(request, room_id):
    chat = ChatRoom.objects.filter(id=room_id).first()
    if not chat:
        return JsonResponse({"error": "Chat room not found"}, status=404)

    if request.method == "DELETE":
        if not chat.can_delete(request.user):
            return JsonResponse({"error": "You are not allowed to delete this chat room"}, status=403)
        chat.delete()
        return JsonResponse({}, status=204)

    return JsonResponse({}, status=405)


@authenticate_user
def join_chat_room(request, room_id):
    chat = ChatRoom.objects.filter(id=room_id).first()
    if not chat:
        return JsonResponse({"error": "Chat room not found"}, status=404)

    if request.method == "POST":
        if chat.members.filter(id=request.user.id).exists():
            return JsonResponse({"message": "User is already a member of this chat room"}, status=200)

        if chat.members.count() >= 2:
            return JsonResponse({"error": "Chat room already has two members"}, status=403)

        chat.members.add(request.user)
        return JsonResponse({"message": "User successfully added to the chat room"}, status=200)

    return JsonResponse({}, status=405)
