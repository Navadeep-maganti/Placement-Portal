from django.db import models
from rest_framework.permissions import IsAuthenticated, IsAdminUser

# Create your models here.
permission_classes = [IsAuthenticated, IsAdminUser]
