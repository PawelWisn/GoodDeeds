import os

import tasks
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GoodDeeds.settings")

app = Celery("GoodDeeds")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
