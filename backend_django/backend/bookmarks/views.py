from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.permissions import IsStudent
from placements.models import Placement
from students.models import Student
from .models import Bookmark
from .serializers import BookmarkSerializer

class MyBookmarksView(generics.ListAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Bookmark.objects.filter(student__user=user).select_related(
                "student", "placement", "placement__company"
            )
        return Bookmark.objects.none()

class BookmarkListCreateView(generics.ListCreateAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_student(self):
        return get_object_or_404(Student, user=self.request.user)

    def get_queryset(self):
        student = self.get_student()
        return Bookmark.objects.filter(student=student).select_related(
            "student", "placement", "placement__company"
        )

    def create(self, request, *args, **kwargs):
        student = self.get_student()
        placement_id = request.data.get("placement_id") or request.data.get("placement")

        if not placement_id:
            return Response(
                {"error": "placement_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            placement = Placement.objects.get(id=placement_id)
            bookmark, created = Bookmark.objects.get_or_create(
                student=student, placement=placement
            )
            if created:
                serializer = self.get_serializer(bookmark)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(
                {"message": "Bookmark already exists."},
                status=status.HTTP_200_OK,
            )
        except Placement.DoesNotExist:
            return Response(
                {"error": "Placement not found."},
                status=status.HTTP_404_NOT_FOUND,
            )


class BookmarkDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request, placement_id):
        student = get_object_or_404(Student, user=request.user)
        bookmark = get_object_or_404(Bookmark, student=student, placement_id=placement_id)
        bookmark.delete()
        return Response({"message": "Bookmark removed successfully."}, status=status.HTTP_200_OK)
