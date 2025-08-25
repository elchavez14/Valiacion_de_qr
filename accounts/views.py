from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User
from .serializers import UserSerializer

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "ADMIN")

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy", "set_role", "set_active"]:
            return [IsAdmin()]
        return super().get_permissions()

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")
        if role not in ["ADMIN", "TECNICO"]:
            return Response({"detail": "Rol inválido"}, status=400)
        user.role = role
        user.save(update_fields=["role"])
        return Response({"detail": f"Rol cambiado a {role}"})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def set_active(self, request, pk=None):
        user = self.get_object()
        active = request.data.get("active")
        user.is_active = bool(active)
        user.save(update_fields=["is_active"])
        return Response({"detail": f"Activo={user.is_active}"})

    @action(detail=False, methods=["POST"], permission_classes=[IsAdmin])
    def create_order(self, request):
        pass  # Aquí va la lógica para crear una orden
