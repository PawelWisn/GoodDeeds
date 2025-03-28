import uuid

from django.contrib.auth.models import AbstractBaseUser, AbstractUser, PermissionsMixin
from django.db import models
from users.managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    REQUIRED_FIELDS = ["sub"]
    USERNAME_FIELD = "id"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sub = models.CharField(max_length=255, unique=True, default=None, null=True)
    is_staff = models.BooleanField(default=False, blank=True)
    is_superuser = models.BooleanField(default=False, blank=True)
    objects = UserManager()
