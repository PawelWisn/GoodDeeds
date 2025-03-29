import json

from chat.models import ChatRoom
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from users.utils import decode_id_token, get_logout_response

User = get_user_model()


def chats_view(request):
    id_token = request.COOKIES.get("id_token")
    if not id_token:
        return get_logout_response({"error": "No id token"}, 401)

    data = decode_id_token(id_token)
    if not data:
        return get_logout_response({"error": "No id token"}, 401)

    user = User.objects.filter(sub=data["sub"]).first()
    if not user:
        return JsonResponse({{"error": "User not found"}}, status=404)

    if request.method == "POST":
        data = json.loads(request.body)
        room_name = data.get("name")

        if not room_name:
            return JsonResponse({"error": "Missing room name"}, status=400)

        chat = ChatRoom.objects.create(name=room_name, created_by=user)
        chat.members.add(user)

        return JsonResponse({"id": chat.id, "name": room_name}, status=201)

    if request.method == "GET":
        available_rooms = ChatRoom.objects.available_to_user(user)
        response_data = [
            {
                "id": room.id,
                "name": room.name,
                "created_by": room.created_by.id,
                "own_room": room.created_by == user,
            }
            for room in available_rooms
        ]
        return JsonResponse(response_data, status=200, safe=False)

    return JsonResponse({}, status=405)
