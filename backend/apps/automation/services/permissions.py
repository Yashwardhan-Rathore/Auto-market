from apps.automation.models import (
    AutomationMember,
)


def can_view(user, automation):

    if user.role == "SUPER_ADMIN":
        return True

    if automation.owner_id == user.id:
        return True

    return AutomationMember.objects.filter(
        automation=automation,
        user=user,
        permission__in=[
            "VIEW",
            "EDIT",
            "EXECUTE",
            "ADMIN",
        ],
    ).exists()


def can_edit(user, automation):

    if automation.owner_id == user.id:
        return True

    return AutomationMember.objects.filter(
        automation=automation,
        user=user,
        permission__in=[
            "EDIT",
            "ADMIN",
        ],
    ).exists()


def can_execute(user, automation):

    if automation.owner_id == user.id:
        return True

    return AutomationMember.objects.filter(
        automation=automation,
        user=user,
        permission__in=[
            "EXECUTE",
            "EDIT",
            "ADMIN",
        ],
    ).exists()


def can_manage(user, automation):

    if automation.owner_id == user.id:
        return True

    return AutomationMember.objects.filter(
        automation=automation,
        user=user,
        permission="ADMIN",
    ).exists()