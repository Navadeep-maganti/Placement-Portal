from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from api.permissions import IsCompany

from .models import Company
from .serializers import CompanyProfileSerializer


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
