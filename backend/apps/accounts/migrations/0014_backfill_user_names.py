from django.db import migrations


def backfill_user_names(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    for user in User.objects.filter(first_name="").iterator():
        email_name = user.email.split("@", 1)[0]
        user.first_name = (
            email_name.replace(".", " ")
            .replace("_", " ")
            .replace("-", " ")
            .title()
        )
        user.save(update_fields=["first_name"])


class Migration(migrations.Migration):
    dependencies = [("accounts", "0013_remove_user_company")]
    operations = [migrations.RunPython(backfill_user_names, migrations.RunPython.noop)]
