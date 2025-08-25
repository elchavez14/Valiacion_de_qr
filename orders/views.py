import io, hashlib, datetime, qrcode, jwt
from django.http import FileResponse, Http404
from django.utils import timezone
from django.conf import settings
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from .serializers import (
    ServiceOrderCreateSerializer, ServiceOrderSerializer,
    FailInstallationSerializer, SuccessInstallationSerializer
)

from accounts.models import User
from .models import ServiceOrder, Evidence
from .serializers import ServiceOrderCreateSerializer, ServiceOrderSerializer
from .serializers import ServiceOrderDetailSerializer
from django.db.models import Count

# Permisos simples
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "ADMIN")

class IsTechnician(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "TECNICO")

class ServiceOrderViewSet(viewsets.GenericViewSet):
    queryset = ServiceOrder.objects.all().order_by("-id")

    def get_permissions(self):
        if self.action in ["create_order","list","retrieve","download_pdf"]:
            # listar/ver: admin ve todo; técnico podría ver solo asignadas (lo filtramos)
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        qs = self.get_queryset()
        if request.user.role == "TECNICO":
            qs = qs.filter(technician=request.user)
        return Response(ServiceOrderSerializer(qs, many=True).data)

    def retrieve(self, request, pk=None):
        try:
            order = self.get_queryset().get(pk=pk)
        except ServiceOrder.DoesNotExist:
            raise Http404
        # si es técnico, asegurar que sea suya
        if request.user.role == "TECNICO" and order.technician_id != request.user.id:
            return Response({"detail": "No autorizado."}, status=403)
        return Response(ServiceOrderSerializer(order).data)

    @action(detail=False, methods=["POST"], permission_classes=[IsAdmin])
    def create_order(self, request):
        """
        Crea la orden: genera JWT, guarda plano + sha256, y setea expires_at.
        """
        s = ServiceOrderCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        # técnico
        try:
            tech = User.objects.get(pk=data["technician_id"], role="TECNICO")
        except User.DoesNotExist:
            return Response({"detail": "Técnico no válido."}, status=400)

        # calcular expiración
        delta = datetime.timedelta(
            seconds=data.get("seconds",0),
            minutes=data.get("minutes",0),
            hours=data.get("hours",0),
            days=data.get("days",0),
        )
        expires_at = timezone.now() + (delta if delta.total_seconds() > 0 else datetime.timedelta(hours=1))

        # generar JWT de la orden (NO confundir con token de login)
        payload = {
            "uuid_order": "temp",  # lo setearemos luego
            "technician_id": tech.id,
            "exp": int(expires_at.timestamp()),
            "iat": int(timezone.now().timestamp()),
        }
        # generamos primero un JWT “provisorio” sin uuid para firmar luego del save
        provisional = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # creamos orden con jwt provisional (actualizaremos payload uuid_order real)
        order = ServiceOrder.objects.create(
            technician=tech,
            technician_name=data["technician_name"],
            jwt_token=provisional,
            jwt_hash=hashlib.sha256(provisional.encode()).hexdigest(),
            expires_at=expires_at,
            status=ServiceOrder.Status.PENDING,
        )

        # ahora re-firmamos jwt con el uuid real
        final_payload = {
            "uuid_order": str(order.uuid_order),
            "technician_id": tech.id,
            "exp": int(expires_at.timestamp()),
            "iat": int(timezone.now().timestamp()),
        }
        final_jwt = jwt.encode(final_payload, settings.SECRET_KEY, algorithm="HS256")
        order.jwt_token = final_jwt
        order.jwt_hash = hashlib.sha256(final_jwt.encode()).hexdigest()
        order.save(update_fields=["jwt_token","jwt_hash"])

        return Response({
            "order": ServiceOrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["GET"])
    def download_pdf(self, request, pk=None):
        """
        Genera y devuelve el PDF con datos de la orden y el QR (link + JWT).
        """
        try:
            # Obtener la orden
            order = self.get_queryset().get(pk=pk)
        except ServiceOrder.DoesNotExist:
            raise Http404

        # Verificar permisos
        if request.user.role == "TECNICO" and order.technician_id != request.user.id:
            return Response({"detail": "No autorizado."}, status=403)

        try:
            # -------- Generar QR --------
            url_base = "http://localhost:5173/open"  
            qr_value = f"{url_base}?id={order.id}#jwt={order.jwt_token}"

            qr_img = qrcode.make(qr_value)
            buf_qr = io.BytesIO()
            qr_img.save(buf_qr, format="PNG")
            buf_qr.seek(0)
            qr_reader = ImageReader(buf_qr)

            # -------- Crear PDF --------
            pdf_buffer = io.BytesIO()
            c = canvas.Canvas(pdf_buffer, pagesize=A4)
            w, h = A4

            # Título
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, h - 60, "Solicitud de Servicio")

            # Datos de la orden
            c.setFont("Helvetica", 11)
            c.drawString(50, h - 90, f"Orden UUID: {order.uuid_order}")
            c.drawString(50, h - 110, f"Técnico asignado: {order.technician_name}")
            c.drawString(50, h - 130, f"Creada: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
            if order.expires_at:
                c.drawString(50, h - 150, f"Expira: {order.expires_at.strftime('%Y-%m-%d %H:%M')}")

            # Insertar QR en la esquina derecha
            qr_size = 160
            c.drawImage(qr_reader, w - qr_size - 50, h - qr_size - 60,
                        qr_size, qr_size, preserveAspectRatio=True, mask="auto")

            # Nota al pie
            c.setFont("Helvetica-Oblique", 10)
            c.drawString(50, 50, "Escanee el QR para abrir la página y copiar el JWT.")

            # Cerrar PDF
            c.showPage()
            c.save()

            # Rebobinar el buffer
            pdf_buffer.seek(0)

            # Devolver el archivo PDF
            return FileResponse(
                pdf_buffer,
                as_attachment=True,
                filename=f"orden_{order.uuid_order}.pdf",
                content_type="application/pdf"
            )
        except Exception as e:
            # Manejar errores y devolver un mensaje claro
            return Response({"detail": f"Error generando el PDF: {str(e)}"}, status=500)

    @action(detail=True, methods=["POST"])
    def start(self, request, pk=None):
        """
        Marca la orden como 'in_use' cuando el técnico realmente la empieza.
        (Opcional pero útil)
        """
        try:
            order = self.get_queryset().get(pk=pk)
        except ServiceOrder.DoesNotExist:
            return Response({"detail":"No encontrada"}, status=404)

        if not ensure_access_technician(request, order):
            return Response({"detail":"No autorizado"}, status=403)

        if not check_expiration(order):
            order.status = ServiceOrder.Status.EXPIRED
            order.save(update_fields=["status"])
            return Response({"detail":"Orden expirada"}, status=400)

        if order.status not in [ServiceOrder.Status.PENDING, ServiceOrder.Status.IN_USE]:
            return Response({"detail": f"No se puede iniciar en estado {order.status}"}, status=400)

        order.status = ServiceOrder.Status.IN_USE
        order.save(update_fields=["status"])
        return Response({"detail": "Orden en uso"}, status=200)

    @action(detail=True, methods=["POST"])
    def fail(self, request, pk=None):
        """
        Camino NO: foto domicilio + justificación + JWT → cierra como 'failed'
        """
        try:
            order = self.get_queryset().get(pk=pk)
        except ServiceOrder.DoesNotExist:
            return Response({"detail":"No encontrada"}, status=404)

        if not ensure_access_technician(request, order):
            return Response({"detail":"No autorizado"}, status=403)

        if not check_expiration(order):
            order.status = ServiceOrder.Status.EXPIRED
            order.save(update_fields=["status"])
            return Response({"detail":"Orden expirada"}, status=400)

        if order.status not in [ServiceOrder.Status.PENDING, ServiceOrder.Status.IN_USE]:
            return Response({"detail": f"No se puede cerrar en estado {order.status}"}, status=400)

        s = FailInstallationSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        # Validar JWT vs hash
        if sha256_str(data["jwt"]) != order.jwt_hash:
            return Response({"detail":"JWT inválido"}, status=400)

        # Guardar evidencia: foto del domicilio
        ev = Evidence.objects.create(
            order=order,
            kind=Evidence.Type.FOTO_DOMICILIO,
            file=data["photo_address"]
        )
        ev.compute_and_set_hash()

        # Cerrar
        order.status = ServiceOrder.Status.FAILED
        order.closing_reason = data["justification"]
        order.closing_notes = data.get("notes","")
        order.closed_at = timezone.now()
        order.save(update_fields=["status","closing_reason","closing_notes","closed_at"])

        return Response({"detail":"Orden cerrada como fallida"}, status=200)

    @action(detail=True, methods=["POST"])
    def succeed(self, request, pk=None):
        """
        Camino SÍ: documento firmado + doc identidad + JWT → cierra como 'completed'
        """
        try:
            order = self.get_queryset().get(pk=pk)
        except ServiceOrder.DoesNotExist:
            return Response({"detail":"No encontrada"}, status=404)

        if not ensure_access_technician(request, order):
            return Response({"detail":"No autorizado"}, status=403)

        if not check_expiration(order):
            order.status = ServiceOrder.Status.EXPIRED
            order.save(update_fields=["status"])
            return Response({"detail":"Orden expirada"}, status=400)

        if order.status not in [ServiceOrder.Status.PENDING, ServiceOrder.Status.IN_USE]:
            return Response({"detail": f"No se puede cerrar en estado {order.status}"}, status=400)

        s = SuccessInstallationSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        # Validar JWT vs hash
        if sha256_str(data["jwt"]) != order.jwt_hash:
            return Response({"detail":"JWT inválido"}, status=400)

        # Evidencias:
        # 1) Doc firmado (puede ser imagen o PDF)
        ev1 = Evidence.objects.create(
            order=order,
            kind=Evidence.Type.DOC_FIRMADO,
            file=data["doc_signed"]
        )
        ev1.compute_and_set_hash()

        # 2) Doc identidad
        ev2 = Evidence.objects.create(
            order=order,
            kind=Evidence.Type.DOC_IDENTIDAD,
            file=data["doc_id"]
        )
        ev2.compute_and_set_hash()
    

        # Cerrar
        order.status = ServiceOrder.Status.COMPLETED
        order.closing_reason = "titular_presente" if data["titular_present"] else "familiar_autorizado"
        order.closing_notes = data.get("notes","")
        order.closed_at = timezone.now()
        order.save(update_fields=["status","closing_reason","closing_notes","closed_at"])

        return Response({"detail":"Orden cerrada como exitosa"}, status=200)

    @action(detail=False, methods=["GET"], permission_classes=[IsAdmin])
    def stats(self, request):
        """
        Devuelve estadísticas de órdenes.
        """
        qs = ServiceOrder.objects.all()

        total = qs.count()
        por_estado = qs.values("status").annotate(total=Count("id"))
        por_tecnico = qs.values("technician_name").annotate(total=Count("id"))
        evidencias_total = Evidence.objects.count()

        return Response({
            "total_orders": total,
            "by_status": {e["status"]: e["total"] for e in por_estado},
            "by_technician": {e["technician_name"]: e["total"] for e in por_tecnico},
            "total_evidences": evidencias_total,
        })

# helpers fuera de la clase
def sha256_str(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def ensure_access_technician(request, order: ServiceOrder):
    # Sólo el técnico asignado puede operar la orden
    if request.user.role != "TECNICO" or order.technician_id != request.user.id:
        return False
    return True

def check_expiration(order: ServiceOrder):
    return not (order.expires_at and order.expires_at < timezone.now())

