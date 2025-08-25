from rest_framework import serializers
from .models import ServiceOrder
from rest_framework import serializers
from .models import ServiceOrder, Evidence

class ServiceOrderCreateSerializer(serializers.Serializer):
    technician_id = serializers.IntegerField()
    technician_name = serializers.CharField(max_length=150)
    # Expiración: segundos/minutos/horas/días (uno de estos, opcional)
    seconds = serializers.IntegerField(required=False)
    minutes = serializers.IntegerField(required=False)
    hours = serializers.IntegerField(required=False)
    days = serializers.IntegerField(required=False)

class ServiceOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrder
        fields = ["id","uuid_order","technician","technician_name","status","created_at","expires_at"]
class FailInstallationSerializer(serializers.Serializer):
    jwt = serializers.CharField()  # JWT pegado por el técnico
    justification = serializers.ChoiceField(choices=[
        ("ausencia_titular", "Ausencia del titular"),
        ("familiar_ausente", "Familiar ausente"),
        ("menor_de_edad", "Menor de edad"),
    ])
    photo_address = serializers.ImageField()     # foto del domicilio
    notes = serializers.CharField(required=False, allow_blank=True)

class SuccessInstallationSerializer(serializers.Serializer):
    jwt = serializers.CharField()
    titular_present = serializers.BooleanField()  # True/False
    doc_signed = serializers.FileField()          # foto o PDF del documento firmado
    doc_id = serializers.ImageField()             # foto documento identidad (titular o familiar)
    notes = serializers.CharField(required=False, allow_blank=True)
    
class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = ["id", "kind", "file", "file_hash", "created_at"]

class ServiceOrderDetailSerializer(serializers.ModelSerializer):
    evidences = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceOrder
        fields = [
            "id","uuid_order","technician","technician_name","status",
            "created_at","expires_at","closing_reason","closing_notes","closed_at",
            "evidences"
        ]