# Generated by Django 4.2.3 on 2023-09-13 06:08

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("student", "0007_alter_student_student_id"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="enroll",
            name="paid_amount",
        ),
        migrations.AddField(
            model_name="transaction",
            name="remark",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="enroll",
            name="discount_amount",
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
    ]
