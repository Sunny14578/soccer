from rest_framework import serializers
from .models import *

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['season', 'name', 'logo', 'venue']

class ScheduleSerializer(serializers.ModelSerializer):
    awayTeam = TeamSerializer()
    homeTeam = TeamSerializer()
        
    class Meta:
        model = Schedule
        fields = '__all__'