def get_dashboard(user):

    if user.role == "SUPER_ADMIN":
        return get_super_admin_dashboard()

    elif user.role == "ADMIN":
        return get_admin_dashboard(user)

    return get_user_dashboard(user)