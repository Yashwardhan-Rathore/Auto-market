from apps.accounts.models import MAUser

def get_dashboard(user):

    ma_user = MAUser.objects.filter(
        user_id=user
    ).first()

    if not ma_user:
        return {}

    # if ma_user.role == "SUPER_ADMIN":
    #     return get_super_admin_dashboard()

    # elif ma_user.role == "ADMIN":
    #     return get_admin_dashboard(user)

    # return get_user_dashboard(user)