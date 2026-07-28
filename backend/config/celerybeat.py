from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {

    "resume-workflows": {
        "task": "apps.automation.tasks_resume.resume_workflows",
        "schedule": 60,
    },

    "campaign-scheduler": {
        "task": "apps.campaigns.tasks.process_scheduled_campaigns",
        "schedule": 60,
    },
}