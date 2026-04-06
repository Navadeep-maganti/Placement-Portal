import random

from django.conf import settings
from django.core.mail import get_connection
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import PendingStudentRegistration, Student
from .serializers import (
    StudentRegistrationRequestSerializer,
    StudentRegistrationVerifySerializer,
    StudentSerializer,
    build_pending_student_registration,
)
from api.permissions import IsStudent

@api_view(["GET"])
def student_detail(request, registration_no):
    student = get_object_or_404(Student, registration_no=registration_no)
    return Response({
        "registration_no": student.registration_no,
        "name": f"{student.user.first_name} {student.user.last_name}".strip(),
        "email": student.user.email,
        "branch": student.department,
        "cgpa": student.cgpa,
    })


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsStudent])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def student_me(request):
    student = Student.objects.get(user=request.user)
    if request.method == "PATCH":
        payload = request.data.copy()
        if hasattr(request.data, "getlist") and "skill_names" in request.data:
            payload.setlist("skill_names", request.data.getlist("skill_names"))
        remove_resume = str(payload.get("remove_resume", "")).lower() in {
            "1",
            "true",
            "yes",
        }
        payload.pop("remove_resume", None)
        if remove_resume and student.resume:
            try:
                student.resume.delete(save=False)
            except OSError:
                pass
            student.resume = None

        serializer = StudentSerializer(
            student,
            data=payload,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = StudentSerializer(student, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def request_student_registration_otp(request):
    serializer = StudentRegistrationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    otp = f"{random.randint(0, 999999):06d}"
    payload = build_pending_student_registration(serializer.validated_data, otp)

    PendingStudentRegistration.objects.update_or_create(
        email=payload["email"],
        defaults=payload,
    )

    if settings.EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend":
        return Response(
            {
                "detail": (
                    "OTP email delivery is not configured on the server yet. "
                    "Set SMTP email settings before requesting OTPs."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    connection = get_connection(fail_silently=False)
    send_mail(
        subject="Placement Portal student registration OTP",
        message=(
            f"Your OTP for Placement Portal student registration is {otp}. "
            f"It expires in {settings.STUDENT_OTP_EXPIRY_MINUTES} minutes."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[payload["email"]],
        fail_silently=False,
        connection=connection,
    )

    return Response(
        {
            "detail": (
                f"OTP sent to {payload['email']}. "
                f"It will expire in {settings.STUDENT_OTP_EXPIRY_MINUTES} minutes."
            )
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_student_registration_otp(request):
    serializer = StudentRegistrationVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    student = serializer.save()
    return Response(
        {
            "detail": "Student account created successfully. You can now sign in.",
            "email": student.user.email,
        },
        status=status.HTTP_201_CREATED,
    )
