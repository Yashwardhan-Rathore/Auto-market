from apps.accounts.models import MAUser

def get_dashboard(user, date_from=None, date_to=None):
    from .services.dashboard import DashboardService
    return DashboardService.get_dashboard(user, date_from=date_from, date_to=date_to)