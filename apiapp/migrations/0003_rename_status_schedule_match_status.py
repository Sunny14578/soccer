# Generated by Django 4.2.7 on 2023-11-14 15:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('apiapp', '0002_team_competitions'),
    ]

    operations = [
        migrations.RenameField(
            model_name='schedule',
            old_name='status',
            new_name='match_status',
        ),
    ]
