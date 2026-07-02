from .manual import ManualTrigger
from .form_submitted import (
    FormSubmittedTrigger
)


TRIGGER_REGISTRY = {

    "MANUAL":
        ManualTrigger(),

    "FORM_SUBMITTED":
        FormSubmittedTrigger(),
}