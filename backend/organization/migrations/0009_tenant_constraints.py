import django.db.models.deletion
import django.db.models.functions.text
import organization.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("organization", "0008_backfill_legacy_organization")]

    operations = [
        *[
            migrations.AlterField(
                model_name=model,
                name="organization",
                field=models.ForeignKey(default=organization.models.get_legacy_organization_pk, on_delete=django.db.models.deletion.PROTECT, related_name="%(class)s_set", to="organization.organization"),
            )
            for model in ["batch", "classs", "exam", "examtype", "schedule", "subject", "teacher"]
        ],
        migrations.AlterField(model_name="batch", name="fee", field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
        migrations.AddConstraint(model_name="batch", constraint=models.UniqueConstraint(django.db.models.functions.text.Lower("code"), models.F("organization"), condition=models.Q(("code__isnull", False)), name="unique_batch_code_per_org_ci")),
        migrations.AddConstraint(model_name="batch", constraint=models.CheckConstraint(condition=models.Q(("start_date__isnull", True), ("end_date__isnull", True), ("start_date__lte", models.F("end_date")), _connector="OR"), name="batch_dates_ordered")),
        migrations.AddConstraint(model_name="batch", constraint=models.CheckConstraint(condition=models.Q(("fee__isnull", True), ("fee__gt", 0), _connector="OR"), name="batch_fee_positive")),
        migrations.AddConstraint(model_name="classs", constraint=models.UniqueConstraint(django.db.models.functions.text.Lower("name"), models.F("organization"), name="unique_class_name_per_org_ci")),
        migrations.AddConstraint(model_name="classs", constraint=models.UniqueConstraint(fields=("organization", "numeric"), name="unique_class_numeric_per_org")),
        migrations.AddConstraint(model_name="classs", constraint=models.CheckConstraint(condition=models.Q(("numeric__gt", 0)), name="class_numeric_positive")),
        migrations.AddConstraint(model_name="exam", constraint=models.CheckConstraint(condition=models.Q(("pass_mark__gt", 0)), name="exam_pass_mark_positive")),
        migrations.AddConstraint(model_name="exam", constraint=models.CheckConstraint(condition=models.Q(("total_mark__gt", 0)), name="exam_total_mark_positive")),
        migrations.AddConstraint(model_name="exam", constraint=models.CheckConstraint(condition=models.Q(("pass_mark__lte", models.F("total_mark"))), name="exam_pass_mark_not_above_total")),
        migrations.AddConstraint(model_name="exam", constraint=models.UniqueConstraint(fields=("organization", "exam_type", "subject"), name="unique_exam_subject_per_type")),
        migrations.AddConstraint(model_name="examtype", constraint=models.CheckConstraint(condition=models.Q(("start_date__lte", models.F("end_date"))), name="exam_type_dates_ordered")),
        migrations.AddConstraint(model_name="examtype", constraint=models.UniqueConstraint(django.db.models.functions.text.Lower("name"), models.F("organization"), models.F("batch"), name="unique_exam_type_per_batch_ci")),
        migrations.AddConstraint(model_name="schedule", constraint=models.CheckConstraint(condition=models.Q(("duration__gt", 0)), name="schedule_duration_positive")),
        migrations.AddConstraint(model_name="subject", constraint=models.UniqueConstraint(django.db.models.functions.text.Lower("code"), models.F("organization"), name="unique_subject_code_per_org_ci")),
    ]
