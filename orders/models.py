import uuid
from django.db import models
from django.conf import settings
import hashlib

def sha256_file(django_file_field):
    # Devuelve el SHA256 (hex) de un FileField ya guardado en disco.
    h = hashlib.sha256()
    for chunk in django_file_field.chunks():
        h.update(chunk)
    return h.hexdigest()

class ServiceOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_USE = "in_use", "En uso"
        COMPLETED = "completed", "Completada"
        FAILED = "failed", "Fallida"
        EXPIRED = "expired", "Expirada"
        USED = "used", "Usada"

    uuid_order = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="service_orders")
    technician_name = models.CharField(max_length=150)
    jwt_token = models.TextField()
    jwt_hash = models.CharField(max_length=64)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    # dentro de ServiceOrder
    closing_reason = models.CharField(max_length=64, blank=True)   # p.ej. ausencia_titular / familiar_ausente / menor_de_edad
    closing_notes = models.TextField(blank=True)                  # texto libre opcional
    closed_at = models.DateTimeField(null=True, blank=True)
    ot_token = models.TextField(blank=True)           # JWT de la OT (generado al crear)
    ot_token_jti = models.CharField(max_length=64, blank=True)  # ID único del token
    


    def __str__(self):
        return f"Orden {self.uuid_order} - {self.technician_name}"

class Evidence(models.Model):
    class Type(models.TextChoices):
        FOTO_DOMICILIO = "foto_domicilio", "Foto del domicilio"
        DOC_FIRMADO = "doc_firmado", "Documento firmado"
        DOC_IDENTIDAD = "doc_identidad", "Documento de identidad"

    order = models.ForeignKey("ServiceOrder", on_delete=models.CASCADE, related_name="evidences")
    kind = models.CharField(max_length=32, choices=Type.choices)
    file = models.FileField(upload_to="evidences/")
    file_hash = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def compute_and_set_hash(self):
        self.file_hash = sha256_file(self.file)
        self.save(update_fields=["file_hash"])

class AuditLog(models.Model):
    order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, related_name="audits")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    action = models.CharField(max_length=50)
    ot_token_copy = models.TextField()
    ot_jti = models.CharField(max_length=64)
    audit_jwt = models.TextField()
    audit_jti = models.CharField(max_length=64)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)