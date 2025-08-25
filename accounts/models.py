from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [
        ("ADMIN", "Administrador"),
        ("TECNICO", "Técnico"),
    ]
    role = models.CharField(max_length=10, choices=ROLES, default="TECNICO")

    def __str__(self):
        return f"{self.username} ({self.role})"
