from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from api.permissions import IsCompany

from .models import Company
from .serializers import CompanyProfileSerializer, RecruiterRegistrationSerializer


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
