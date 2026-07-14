from apps.accounts.models import MAUser

class SuperAdminStatsService:
    @classmethod
    def get_stats(cls):
        total_admins = MAUser.objects.filter(role="ADMIN").count()
        total_users = MAUser.objects.filter(role="USER").count()
        
        return {
            "total_admins": total_admins,
            "total_users": total_users
        }
