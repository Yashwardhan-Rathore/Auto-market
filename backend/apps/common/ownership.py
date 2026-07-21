from django.db.models import Q
from apps.accounts.models import MAUser
from django.contrib.auth import get_user_model

User = get_user_model()

def get_admin_profile(user):
    """
    Returns the MAUser profile for the given user, avoiding N+1 if already selected.
    In practice, using select_related/prefetch_related on the view level helps here.
    """
    if not user.is_authenticated:
        return None
    # If ma_users is prefetched, use it without querying.
    ma_users = getattr(user, '_prefetched_objects_cache', {}).get('ma_users')
    if ma_users:
        return ma_users[0] if ma_users else None
    return user.ma_users.first()

def is_super_admin(user):
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    profile = get_admin_profile(user)
    return profile is not None and profile.role == "SUPER_ADMIN"

def get_managed_users_queryset(admin_user):
    """
    Returns a queryset of User objects managed by this admin_user.
    For SUPER_ADMIN, it returns all users with role 'USER'.
    For ADMIN, it returns only their directly managed users.
    """
    if is_super_admin(admin_user):
        return User.objects.filter(ma_users__role="USER", is_active=True).prefetch_related("ma_users")
    
    admin_profile = get_admin_profile(admin_user)
    if admin_profile and admin_profile.role == "ADMIN":
        return User.objects.filter(
            ma_users__role="USER", 
            ma_users__managed_by=admin_profile,
            is_active=True
        ).prefetch_related("ma_users")
    
    return User.objects.none()

def get_managed_user_ids(admin_user):
    """Returns a list of IDs of users managed by this admin."""
    return list(get_managed_users_queryset(admin_user).values_list("id", flat=True))

def is_managed_user(admin_user, target_user):
    """
    Checks if target_user is managed by admin_user.
    SUPER_ADMIN manages everyone (with role='USER').
    """
    if not target_user or not target_user.is_authenticated:
        return False
    
    target_profile = get_admin_profile(target_user)
    if not target_profile or target_profile.role != "USER":
        return False

    if is_super_admin(admin_user):
        return True
    
    admin_profile = get_admin_profile(admin_user)
    if admin_profile and admin_profile.role == "ADMIN":
        return target_profile.managed_by_id == admin_profile.id
        
    return False

def filter_users_for_admin(queryset, admin_user):
    """Filters a queryset of User objects based on admin ownership."""
    if is_super_admin(admin_user):
        return queryset
    admin_profile = get_admin_profile(admin_user)
    if admin_profile and admin_profile.role == "ADMIN":
        return queryset.filter(
            ma_users__role="USER",
            ma_users__managed_by=admin_profile
        )
    return queryset.none()

def _filter_resource_for_admin(queryset, admin_user, user_field="created_by"):
    """
    Core filter:
    SUPER_ADMIN -> all
    ADMIN -> own resources OR resources of managed users
    USER -> own resources OR resources created by their managing ADMIN
    """
    if is_super_admin(admin_user):
        return queryset
        
    admin_profile = get_admin_profile(admin_user)
    
    if admin_profile and admin_profile.role == "ADMIN":
        return queryset.filter(
            Q(**{user_field: admin_user}) | 
            Q(**{f"{user_field}__ma_users__managed_by": admin_profile})
        ).distinct()
        
    elif admin_profile and admin_profile.role == "USER":
        # A user can access their own resources
        q = Q(**{user_field: admin_user})
        # If they need to access resources from their admin (e.g. Audiences)
        if admin_profile.managed_by_id:
            q |= Q(**{f"{user_field}": admin_profile.managed_by.user})
        return queryset.filter(q).distinct()
        
    return queryset.none()

def filter_tasks_for_admin(queryset, admin_user):
    return _filter_resource_for_admin(queryset, admin_user, "created_by")

def filter_campaigns_for_admin(queryset, admin_user):
    return _filter_resource_for_admin(queryset, admin_user, "created_by")

def filter_templates_for_admin(queryset, admin_user):
    return _filter_resource_for_admin(queryset, admin_user, "created_by")

def filter_dashboard_queryset(queryset, admin_user, user_field="created_by"):
    return _filter_resource_for_admin(queryset, admin_user, user_field)

def filter_audiences_for_admin(queryset, admin_user):
    return _filter_resource_for_admin(queryset, admin_user, "created_by")

def can_manage_user(admin_user, target_user):
    return is_managed_user(admin_user, target_user)

def can_manage_task(admin_user, task):
    if is_super_admin(admin_user):
        return True
    admin_profile = get_admin_profile(admin_user)
    if admin_profile and admin_profile.role == "ADMIN":
        return task.created_by == admin_user or is_managed_user(admin_user, task.created_by)
    return False

def can_manage_campaign(admin_user, campaign):
    if is_super_admin(admin_user):
        return True
    admin_profile = get_admin_profile(admin_user)
    if admin_profile and admin_profile.role == "ADMIN":
        return campaign.created_by == admin_user or is_managed_user(admin_user, campaign.created_by)
    return False

def can_manage_template(admin_user, template):
    if is_super_admin(admin_user):
        return True
    admin_profile = get_admin_profile(admin_user)
    if admin_profile and admin_profile.role == "ADMIN":
        return template.created_by == admin_user or is_managed_user(admin_user, template.created_by)
    return False

def filter_customer_records_for_admin(queryset, admin_user):
    """For CustomerRecord which has upload__uploaded_by"""
    return _filter_resource_for_admin(queryset, admin_user, "upload__uploaded_by")

def filter_customer_uploads_for_admin(queryset, admin_user):
    return _filter_resource_for_admin(queryset, admin_user, "uploaded_by")
