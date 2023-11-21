from django.urls import path, include
from .views import *

urlpatterns = [
    path('schedule/', ScheduleAPIView.as_view()),
    # path('schedule/<int:requested_date>/', ScheduleAPIView.as_view()),
    path('competitionTeam/', TeamAPIView.as_view()),
]