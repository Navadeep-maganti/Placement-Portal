import logging

from django.conf import settings
from django.core.mail import get_connection, send_mail


logger = logging.getLogger(__name__)


def get_otp_email_configuration_error():
    if settings.EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend":
        return (
            "OTP email delivery is not configured on the server yet. "
            "Add your SMTP settings to backend_django/backend/.env before requesting OTPs."
        )

    if settings.EMAIL_BACKEND == "django.core.mail.backends.smtp.EmailBackend":
        missing_settings = [
            setting_name
            for setting_name, setting_value in (
                ("EMAIL_HOST", settings.EMAIL_HOST),
                ("EMAIL_HOST_USER", settings.EMAIL_HOST_USER),
                ("EMAIL_HOST_PASSWORD", settings.EMAIL_HOST_PASSWORD),
            )
            if not setting_value
        ]
        if missing_settings:
            return (
                "OTP email delivery is not configured correctly. "
                f"Set {', '.join(missing_settings)} in backend_django/backend/.env."
            )

    return None


def send_transactional_email(subject, message, recipient_list, fail_silently=False):
    connection = get_connection(fail_silently=fail_silently)
    return send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=fail_silently,
        connection=connection,
    )


def send_notification_email(subject, message, recipient_list):
    try:
        send_transactional_email(
            subject=subject,
            message=message,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return True
    except Exception:
        logger.exception(
            "Failed to deliver notification email.",
            extra={"subject": subject, "recipient_list": recipient_list},
        )
        return False
