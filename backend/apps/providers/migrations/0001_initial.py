

from decimal import Decimal
from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ProviderProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('service_types', models.JSONField(blank=True, default=list)),
                ('is_available', models.BooleanField(db_index=True, default=False)),
                ('latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True, validators=[django.core.validators.MinValueValidator(Decimal('-90.0')), django.core.validators.MaxValueValidator(Decimal('90.0'))])),
                ('longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True, validators=[django.core.validators.MinValueValidator(Decimal('-180.0')), django.core.validators.MaxValueValidator(Decimal('180.0'))])),
                ('rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(5)])),
                ('total_jobs', models.PositiveIntegerField(default=0)),
                ('bio', models.TextField(blank=True)),
                ('location_updated_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='provider_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Provider Profile',
                'verbose_name_plural': 'Provider Profiles',
                'db_table': 'provider_profiles',
                'indexes': [models.Index(fields=['is_available'], name='provider_pr_is_avai_9b056a_idx'), models.Index(fields=['latitude', 'longitude'], name='provider_pr_latitud_50a651_idx')],
            },
        ),
    ]
