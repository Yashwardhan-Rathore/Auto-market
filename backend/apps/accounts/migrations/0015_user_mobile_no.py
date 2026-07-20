from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("accounts", "0014_backfill_user_names")]

    operations = [
        migrations.AddField(
            model_name="user",
            name="mobile_no",
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
