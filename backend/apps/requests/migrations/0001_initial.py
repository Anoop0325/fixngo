

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('providers', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ServiceRequest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('service_type', models.CharField(choices=[('mechanic', 'Mechanic'), ('fuel', 'Fuel Delivery'), ('towing', 'Towing'), ('battery', 'Battery Jump-start'), ('tyre', 'Tyre Change')], db_index=True, max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('expired', 'Expired')], db_index=True, default='pending', max_length=15)),
                ('user_latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('user_longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('user_address', models.TextField(blank=True, help_text='Human-readable address if available')),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField()),
                ('provider', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_requests', to='providers.providerprofile')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='service_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Service Request',
                'verbose_name_plural': 'Service Requests',
                'db_table': 'service_requests',
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['user', 'status'], name='service_req_user_id_5c7a65_idx'), models.Index(fields=['status', 'created_at'], name='service_req_status_9bff2a_idx'), models.Index(fields=['expires_at'], name='service_req_expires_157929_idx')],
            },
        ),
    ]
