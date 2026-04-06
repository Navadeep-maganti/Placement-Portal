import random

from django.db import transaction
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from api.email_utils import get_otp_email_configuration_error, send_transactional_email
from api.permissions import IsCompany

from .models import Company, PendingRecruiterRegistration
from .serializers import (
    CompanyProfileSerializer,
    RecruiterRegistrationRequestSerializer,
    RecruiterRegistrationSerializer,
    RecruiterRegistrationVerifySerializer,
    build_pending_recruiter_registration,
)


def get_or_create_company_for_user(user):
    default_name = (
        f"{user.first_name} {user.last_name}".strip()
        or user.email.split("@", 1)[0].replace(".", " ").title()
        or "Recruiter Company"
    )
    company, _ = Company.objects.get_or_create(
        user=user,
        defaults={
            "company_name": default_name,
            "location": "Update location",
            "industry": "Update industry",
            "website": "",
            "description": "Update company description",
            "is_approved": False,
        },
    )
    return company


class CompanyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_object(self):
        return get_or_create_company_for_user(self.request.user)


class RecruiterRegistrationView(generics.GenericAPIView):
    serializer_class = RecruiterRegistrationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "detail": (
                    "Recruiter account created successfully. Admin approval is pending."
                )
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def request_recruiter_registration_otp(request):
    serializer = RecruiterRegistrationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    configuration_error = get_otp_email_configuration_error()
    if configuration_error:
        return Response(
            {"detail": configuration_error},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    otp = f"{random.randint(0, 999999):06d}"
    payload = build_pending_recruiter_registration(serializer.validated_data, otp)

    try:
        with transaction.atomic():
            PendingRecruiterRegistration.objects.update_or_create(
                email=payload["email"],
                defaults=payload,
            )
            send_transactional_email(
                subject="Placement Portal recruiter registration OTP",
                message=(
                    f"Your OTP for Placement Portal recruiter registration is {otp}. "
                    "It expires in 10 minutes."
                ),
                recipient_list=[payload["email"]],
                fail_silently=False,
            )
    except Exception:
        return Response(
            {
                "detail": (
                    "Unable to send the OTP email right now. "
                    "Check the SMTP host, username, password, and TLS settings in "
                    "backend_django/backend/.env and try again."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "detail": (
                f"OTP sent to {payload['email']}. "
                "It will expire in 10 minutes."
            )
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_recruiter_registration_otp(request):
    serializer = RecruiterRegistrationVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    company = serializer.save()
    return Response(
        {
            "detail": (
                "Recruiter account created successfully. Admin approval is pending."
            ),
            "email": company.user.email,
        },
        status=status.HTTP_201_CREATED,
    )
