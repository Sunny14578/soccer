from django.urls import path
from .views import home, schedule

urlpatterns = [
    path('', home, name='home'),
    path('schedule/', schedule, name='schedule'),
]