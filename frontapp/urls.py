from django.urls import path
from .views import home, schedule, slidetest

urlpatterns = [
    path('', home, name='home'),
    path('schedule/', schedule, name='schedule'), 
    path('test/', slidetest, name='test'),
]