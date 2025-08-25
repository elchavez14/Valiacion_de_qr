from django.core.management.base import BaseCommand
from django.utils import timezone
from orders.models import ServiceOrder

class Command(BaseCommand):
    help = "Marca como expiradas todas las órdenes cuyo expires_at ya pasó"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        expiradas = ServiceOrder.objects.filter(
            expires_at__lt=now, status__in=["pending", "in_use"]
        )
        total = expiradas.update(status="expired")
        self.stdout.write(self.style.SUCCESS(f"{total} órdenes expiradas"))
