from .send_email import SendEmailAction
from .create_task import CreateTaskAction
from .end import EndAction


ACTION_REGISTRY = {

    "SEND_EMAIL":
        SendEmailAction(),

    "CREATE_TASK":
        CreateTaskAction(),

    "END":
        EndAction(),
}