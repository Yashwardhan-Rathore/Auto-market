from django.db import migrations, models


FORWARD_SQL = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'campaigns'
          AND column_name = 'started_at'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'campaigns'
          AND column_name = 'processing_started_at'
    ) THEN
        ALTER TABLE campaigns RENAME COLUMN started_at TO processing_started_at;
    ELSIF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'campaigns'
          AND column_name = 'processing_started_at'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN processing_started_at timestamp with time zone NULL;
    END IF;
END $$;
"""

REVERSE_SQL = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'campaigns'
          AND column_name = 'processing_started_at'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'campaigns'
          AND column_name = 'started_at'
    ) THEN
        ALTER TABLE campaigns RENAME COLUMN processing_started_at TO started_at;
    END IF;
END $$;
"""


class Migration(migrations.Migration):
    dependencies = [
        ("campaigns", "0017_alter_campaigntemplate_template"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(FORWARD_SQL, reverse_sql=REVERSE_SQL),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name="campaign",
                    name="started_at",
                    field=models.DateTimeField(
                        blank=True,
                        db_column="processing_started_at",
                        null=True,
                    ),
                ),
            ],
        ),
    ]
