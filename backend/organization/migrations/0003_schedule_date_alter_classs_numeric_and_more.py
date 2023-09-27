# Generated by Django 4.2.3 on 2023-08-18 15:51

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0002_alter_batch_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="schedule",
            name="date",
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="classs",
            name="numeric",
            field=models.IntegerField(unique=True),
        ),
        migrations.AlterField(
            model_name="schedule",
            name="duration",
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name="schedule",
            name="time",
            field=models.TimeField(),
        ),
        migrations.AlterField(
            model_name="subject",
            name="code",
            field=models.CharField(max_length=16, unique=True),
        ),
    ]