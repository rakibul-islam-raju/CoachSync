from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from celery import shared_task

from .models import ResultDelivery


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_result_publication_email(self, delivery_id):
    delivery = ResultDelivery.objects.select_related(
        "recipient", "outcome__student__user", "outcome__publication__exam_type"
    ).get(pk=delivery_id)
    delivery.attempts += 1
    try:
        publication = delivery.outcome.publication
        student = delivery.outcome.student
        url = f"{settings.FRONTEND_BASE_URL}/results"
        send_mail(
            subject=f"{publication.exam_type.name} result published",
            message=(
                f"The result for {student.user.full_name()} has been published. "
                f"Sign in to view it: {url}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[delivery.recipient.email],
        )
        delivery.status = ResultDelivery.SENT
        delivery.sent_at = timezone.now()
        delivery.failure_message = ""
    except Exception as exc:
        delivery.status = ResultDelivery.FAILED
        delivery.failure_message = str(exc)[:1000]
        delivery.save(
            update_fields=["attempts", "status", "failure_message"]
        )
        raise
    delivery.save(
        update_fields=["attempts", "status", "sent_at", "failure_message"]
    )
