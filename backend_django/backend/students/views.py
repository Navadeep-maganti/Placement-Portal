from rest_framework.decorators import api_view, permission_classes
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
        "name": f"{student.first_name} {student.last_name}",
        "email": student.email,
        "branch": student.branch,
        "cgpa": student.cgpa,
    })
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def student_me(request):
    student = Student.objects.get(user=request.user)
    serializer = StudentSerializer(student)
    return Response(serializer.data)
