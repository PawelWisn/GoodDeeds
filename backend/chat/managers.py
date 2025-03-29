from django.db.models import Manager


class ChatRoomManager(Manager):
    def with_one_member(self):
        return self.filter(members__count=1).distinct()

    def where_user_is_member(self, user):
        return self.filter(members__in=user).distinct()

    def available_to_user(self, user):
        return self.where_user_is_member(user).union(self.with_one_member().exclude(created_by=user)).distinct()
