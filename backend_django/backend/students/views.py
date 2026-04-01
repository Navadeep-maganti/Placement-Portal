from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer
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
            student.resume.delete(save=False)
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
