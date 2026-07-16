def filter_by_tenant(queryset, user, user_field="created_by"):
    """
    Filters a queryset based on user hierarchy for data isolation:
    - is_superuser: System global admin, sees all data.
    - SUPER_ADMIN: Sees all data in the database.
    - ADMIN: Head of the department, sees everything in their department.
    - USER: Employee, sees only their own data.
    """
    if not user.is_authenticated:
        return queryset.none()

    if getattr(user, "is_superuser", False):
        return queryset

    # Determine user role
    ma_user = getattr(user, "ma_users", None)
    if ma_user:
        ma_user = ma_user.first()
    
    role = ma_user.role if ma_user else "USER"
    
    # 1. SUPER_ADMIN: Filter by company (Now sees all in DB)
    if role == "SUPER_ADMIN":
        return queryset

    # 2. ADMIN: Filter by department
    if role == "ADMIN":
        department_id = getattr(user, "department_id", None)
        if department_id:
            return queryset.filter(**{f"{user_field}__department_id": department_id})
        # If an ADMIN lacks a department, fallback to their own data only
        return queryset.filter(**{user_field: user})

    # 3. USER: Employee, sees only their own data
    return queryset.filter(**{user_field: user})
