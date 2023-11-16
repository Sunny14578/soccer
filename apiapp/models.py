from django.db import models

class Competition(models.Model):
    name = models.CharField(max_length=50)
    logo = models.CharField(max_length=255)
    type = models.CharField(max_length=30)

class Team(models.Model):
    season = models.IntegerField()
    name = models.CharField(max_length=50)
    logo = models.CharField(max_length=255)
    venue = models.CharField(max_length=100)
    competitions = models.ManyToManyField(Competition)

class Schedule(models.Model):
    matchday = models.IntegerField()
    utcDate = models.DateTimeField()
    match_status = models.CharField(max_length=30)
    awayTeam = models.ForeignKey(Team, related_name='away_matches', on_delete=models.CASCADE)
    homeTeam = models.ForeignKey(Team, related_name='home_matches', on_delete=models.CASCADE)
    score_home = models.PositiveIntegerField(default=0, null=True)  # 예시로 home 팀의 스코어
    score_away = models.PositiveIntegerField(default=0, null=True)  # 예시로 away 팀의 스코어
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE)
