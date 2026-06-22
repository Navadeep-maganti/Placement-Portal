from django.conf import settings

from .email_utils import send_notification_email


def send_application_status_update_email(application, previous_status=None, remarks=""):
    student_email = application.student.user.email
    if not student_email:
        return False

    current_status_name = application.status.name
    previous_status_name = previous_status.name if previous_status else "Application Submitted"
    subject = f"Placement Portal Update: {application.job.job_title} - {current_status_name}"
    message_lines = [
        f"Dear {application.student.user.first_name or 'Student'},",
        "",
        "Your application status has been updated on Placement Portal.",
        "",
        f"Company: {application.job.company.company_name}",
        f"Role: {application.job.job_title}",
        f"Previous status: {previous_status_name}",
        f"Current status: {current_status_name}",
    ]
    if remarks:
        message_lines.extend(
            [
                "",
                "Recruiter remarks:",
                remarks,
            ]
        )
    message_lines.extend(
        [
            "",
            "Please log in to the portal to review the latest details and next steps.",
            "",
            "Regards,",
            "Placement Portal Team",
        ]
    )
    return send_notification_email(subject, "\n".join(message_lines), [student_email])


def send_new_eligible_job_email(student, placement):
    student_email = student.user.email
    if not student_email:
        return False

    eligibility_details = placement.get_eligibility_details()
    subject = (
        f"New Eligible Opportunity: {placement.job_title} at "
        f"{placement.company.company_name}"
    )
    message_lines = [
        f"Dear {student.user.first_name or 'Student'},",
        "",
        "A new job has been posted on Placement Portal and your profile appears to be eligible.",
        "",
        f"Company: {placement.company.company_name}",
        f"Role: {placement.job_title}",
        f"Location: {placement.company.location}",
        f"Industry: {placement.company.industry}",
        f"Application deadline: {placement.application_deadline.isoformat()}",
        f"Minimum CGPA: {eligibility_details['min_cgpa']}",
    ]

    allowed_departments = eligibility_details.get("allowed_departments") or []
    if allowed_departments:
        message_lines.append(f"Eligible departments: {', '.join(allowed_departments)}")

    if eligibility_details.get("max_backlogs") is not None:
        message_lines.append(
            f"Maximum backlogs allowed: {eligibility_details['max_backlogs']}"
        )

    required_skill_names = list(placement.required_skills.values_list("name", flat=True))
    if required_skill_names:
        message_lines.append(f"Relevant skills: {', '.join(required_skill_names)}")

    message_lines.extend(
        [
            "",
            "Please log in to Placement Portal to review the role details and apply if interested.",
            "",
            "Regards,",
            "Placement Portal Team",
        ]
    )
    return send_notification_email(subject, "\n".join(message_lines), [student_email])


def notify_eligible_students_for_new_placement(placement):
    from students.models import Student

    delivered = 0
    for student in Student.objects.select_related("user").all():
        email = (student.user.email or "").strip().lower()
        if (
            not student.user.is_active
            or not email
            or not email.endswith(settings.STUDENT_EMAIL_DOMAIN)
        ):
            continue
        is_eligible, _reasons = placement.is_student_eligible(student)
        if not is_eligible:
            continue
        if send_new_eligible_job_email(student, placement):
            delivered += 1
    return delivered
