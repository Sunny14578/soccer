from django.urls import path, include
from .views import *

urlpatterns = [
    path('schedule/', ScheduleAPIView.as_view()),
    path('competitionTeam/', TeamAPIView.as_view()),
    # path('join/user/', JoinApiView.as_view()),
]