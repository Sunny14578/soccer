from django.shortcuts import render, HttpResponse
from pathlib import Path
import os, json, requests, logging
from django.core.exceptions import ImproperlyConfigured
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.views import APIView
from .models import Team, Competition, Schedule
from django.db import transaction
from .serializers import *

BASE_DIR = Path(__file__).resolve().parent.parent

secret_file = os.path.join(BASE_DIR, 'secret.json')

logger = logging.getLogger(__name__)

try:
    with open(secret_file, 'r') as f:
        secrets = json.loads(f.read())
except FileNotFoundError as e:
	logger.error(e)


def get_secret(KEY, secrets=secrets):
    """
    secret.json 파일에서 key 값을 가져옵니다.
    """
    try:
        return secrets[KEY]
    except KeyError:
        error_msg = "Set the {} environment variable".format(KEY)
    raise ImproperlyConfigured(error_msg)

KEY = get_secret("API_KEY")

class TeamAPIView(APIView):
    # def get(self, request):
    #     return render(request, self.template_name)

    @transaction.atomic
    def post(self, request):
        data = get_competition_team()

        desired_competition_name = 'Premier League'
        competition = Competition.objects.get(name=desired_competition_name)
   
        season = data['filters']['season']

        try:
            for i in data['teams']:
                crest = i['crest']
                name = i['name']
                venue = i['venue']
                
                existing_team = Team.objects.filter(season=season, name=name).first()

                if existing_team:
                    team = existing_team
                else:
                    team = Team(season=season, logo=crest, name=name, venue=venue)
                    team.save()
                    team.competitions.add(competition)

            return Response({"message": 1}, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = str(e)
            return Response({"message": 0, "error":error_message}, status=status.HTTP_400_BAD_REQUEST)

def get_competition_team():
    """
    Get competition team from the API.

    API Reference:
    - https://api.football-data.org/v4/competitions
    """
     
    uri = 'http://api.football-data.org/v4/competitions/PL/teams?season=2023'
    headers = { 'X-Auth-Token': KEY }

    try:
        response = requests.get(uri, headers=headers)
        response.raise_for_status() 
        data = response.json()
        return data

    except requests.exceptions.RequestException as e:
        print(f"Error making the API request: {e}")
        # 에러 응답을 반환
        return Response({'error': 'Error making the API request'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleAPIView(APIView):
    def get(self, request):
        schedules = Schedule.objects.all().select_related('awayTeam', 'homeTeam')

        # 전체 데이터를 시리얼라이즈
        serializer = ScheduleSerializer(schedules, many=True)
        # JSON 응답으로 반환
        return Response({"message": '성공', "data" : serializer.data}, status=status.HTTP_200_OK)
    

    @transaction.atomic
    def post(self, request):
        data = get_soccer_schedule()
        season = data['filters']['season']

        desired_competition_name = 'Team 1'
        desired_season = '2023'

        # season과 name을 동시에 고려하여 특정 Team 가져오기
        datas = []

        try:
            for i in data['matches']:
                matchday = i['matchday']
                utcDate = i['utcDate']
                match_status = i['status']

                team = get_foreign_team(season, i['homeTeam']['name'], i['awayTeam']['name'])
                awayTeam = team[1]
                homeTeam = team[0]

                score_home = i['score']['fullTime']['home']
                score_away = i['score']['fullTime']['away']
                competition = Competition.objects.get(name=i['competition']['name'])

                datas.append(Schedule(
                    matchday=matchday,
                    utcDate=utcDate,
                    match_status=match_status,
                    homeTeam=homeTeam,
                    awayTeam=awayTeam,
                    score_home=score_home,
                    score_away=score_away,
                    competition=competition,
                ))

            Schedule.objects.bulk_create(datas)
            return Response({"message": '성공'}, status=status.HTTP_200_OK)
        except Exception as e:
            error_message = str(e)
            return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)
        

def get_soccer_schedule():
    """
    Get soccer schedule from the API.

    API Reference:
    - https://api.football-data.org/v4/competitions
    """
     
    uri = 'https://api.football-data.org/v4/competitions/PL/matches?YEAR=2023'
    headers = { 'X-Auth-Token': KEY }

    try:
        response = requests.get(uri, headers=headers)
        response.raise_for_status() 
        schedule_data = response.json()

        return schedule_data
     
    except requests.exceptions.RequestException as e:
        print(f"Error making the API request: {e}")
        raise

def get_foreign_team(season, home, away):
    home_team = Team.objects.get(name=home, season=season)
    away_team = Team.objects.get(name=away, season=season)
    return [home_team, away_team]