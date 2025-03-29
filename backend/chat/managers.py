from django.db.models import Count, Manager


class ChatRoomManager(Manager):
    def with_one_member(self):
        counted = self.annotate(members_count=Count("members")).filter(members_count=1)
        return self.filter(id__in=counted).distinct()

    def where_user_is_member(self, user):
        return self.filter(members__in=[user]).distinct()

    def available_to_user(self, user):
        return self.where_user_is_member(user) | self.with_one_member().exclude(created_by=user)
