from django.core.management.base import BaseCommand

from apps.campaigns.services.scheduler import SchedulerService


class Command(BaseCommand):

    help = "Run scheduled campaigns."

    def handle(self, *args, **options):

        result = SchedulerService.run()

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed: {result['processed']} | "
                f"Success: {result['success']} | "
                f"Failed: {result['failed']}"
            )
        )