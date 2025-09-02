from rest_framework_simplejwt.tokens import AccessToken
from django.utils import timezone

def make_ot_token(created_by_user, order):
    """
    Genera el JWT principal de la orden de trabajo (OT).
    """
    t = AccessToken()
    t["typ"] = "order"
    t["order_id"] = order.id
    t["uuid_order"] = str(order.uuid_order)
    t["created_by"] = created_by_user.id
    t["iat_human"] = timezone.now().isoformat()
    return str(t), t["jti"]


def make_audit_token(admin_user, order, action, old=None, new=None):
    """
    Genera un JWT de auditoría para cambios hechos por administrativos.
    """
    t = AccessToken()
    t["typ"] = "audit"
    t["sub"] = admin_user.id
    t["role"] = getattr(admin_user, "role", None)
    t["order_id"] = order.id
    t["action"] = action
    t["old"] = old or {}
    t["new"] = new or {}
    t["iat_human"] = timezone.now().isoformat()
    return str(t), t["jti"]
