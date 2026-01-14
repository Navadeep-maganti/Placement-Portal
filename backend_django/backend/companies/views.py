from django.shortcuts import render

from rest_framework.permissions import IsAuthenticated
from api.permissions import IsCompany

# Create your views here.
permission_classes = [IsAuthenticated, IsCompany]
