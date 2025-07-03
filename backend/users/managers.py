from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Manager


class UserManager(Manager):
    def create_user(self, sub: str, **extra_fields):
        from users.models import User

        user = User(sub=sub, **extra_fields)
        user.save()
        return user

    def create_superuser(self, sub: str, **extra_fields):
        return self.create_user(
            sub,
            is_staff=True,
            is_superuser=True,
            **extra_fields,
        )

    def get_or_create(self, sub: str):
        try:
            return self.get(sub=sub), False
        except ObjectDoesNotExist:
            return self.create_user(sub=sub), True
