# Generated by Django 4.2.3 on 2023-09-12 07:06

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("student", "0006_student_student_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="student",
            name="student_id",
            field=models.CharField(
                blank=True, db_index=True, max_length=50, unique=True
            ),
        ),
    ]