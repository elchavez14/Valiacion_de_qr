from django.contrib import admin
from .models import ServiceOrder

@admin.register(ServiceOrder)
class ServiceOrderAdmin(admin.ModelAdmin):
    list_display = ("uuid_order","technician","technician_name","status","created_at","expires_at")
    list_filter = ("status",)
    search_fields = ("uuid_order","technician__username","technician_name")
