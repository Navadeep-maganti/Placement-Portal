from django.urls import path
from .views import BookmarkDeleteView, BookmarkListCreateView, MyBookmarksView

urlpatterns = [
    path("", BookmarkListCreateView.as_view(), name="bookmark_list_create"),
    path("<int:placement_id>/", BookmarkDeleteView.as_view(), name="bookmark_delete"),
    path("mybookmarks/", MyBookmarksView.as_view(), name="my_bookmarks"),
]
