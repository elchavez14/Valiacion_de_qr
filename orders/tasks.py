from django.utils import timezone
from orders.models import ServiceOrder
from celery import shared_task

@shared_task
def expire_orders():
    now = timezone.now()
    expiradas = ServiceOrder.objects.filter(
        expires_at__lt=now, status__in=["pending","in_use"]
    )
    return expiradas.update(status="expired")
