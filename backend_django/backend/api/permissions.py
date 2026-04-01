from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "student"
        )

class IsCompany(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'company'


class IsApprovedCompany(BasePermission):
    message = "Your recruiter account is pending admin approval."

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated or user.role != "company":
            return False

        company = getattr(user, "company", None)
        return bool(company and company.is_approved)

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
