# Generated by Django 4.2.3 on 2023-07-20 04:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="batch",
            name="description",
            field=models.TextField(blank=True, null=True),
        ),
    ]