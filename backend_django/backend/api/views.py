from rest_framework_simplejwt.views import TokenObtainPairView
from api.serializers import LoginSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_me(request):
    """Get current user info"""
    return Response({
        "user_id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "role": request.user.role,
        "is_authenticated": True,
    })
