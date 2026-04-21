

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('requests', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notification_type', models.CharField(choices=[('request_received', 'Request Received'), ('status_update', 'Status Update'), ('request_cancelled', 'Request Cancelled'), ('request_expired', 'Request Expired')], default='status_update', max_length=30)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(db_index=True, default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
                ('request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='requests.servicerequest')),
            ],
            options={
                'db_table': 'notifications',
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['recipient', 'is_read'], name='notificatio_recipie_583549_idx'), models.Index(fields=['recipient', 'created_at'], name='notificatio_recipie_2c3905_idx')],
            },
        ),
    ]
