

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='provider_feedback',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='provider_rating',
            field=models.PositiveSmallIntegerField(blank=True, help_text='Rating given by provider to user', null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)]),
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='user_feedback',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='user_rating',
            field=models.PositiveSmallIntegerField(blank=True, help_text='Rating given by user to provider', null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)]),
        ),
    ]
