from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {

    "resume-workflows": {

        "task":
            "apps.automation.tasks_resume.resume_workflows",

        "schedule": 60,

    }

}