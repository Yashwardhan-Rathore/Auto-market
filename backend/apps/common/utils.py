def filter_by_tenant(queryset, user, user_field="created_by"):
    """
    Filters a queryset based on user hierarchy for data isolation:
    - is_superuser: System global admin, sees all data across all companies.
    - SUPER_ADMIN: Head of the company, sees everything in their company.
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
    
    # 1. SUPER_ADMIN: Filter by company
    if role == "SUPER_ADMIN":
        company_id = getattr(user, "company_id", None)
        if company_id:
            return queryset.filter(**{f"{user_field}__company_id": company_id})
        # If a SUPER_ADMIN lacks a company, fallback to their own data only
        return queryset.filter(**{user_field: user})

    # 2. ADMIN: Filter by department
    if role == "ADMIN":
        department_id = getattr(user, "department_id", None)
        if department_id:
            return queryset.filter(**{f"{user_field}__department_id": department_id})
        # If an ADMIN lacks a department, fallback to their own data only
        return queryset.filter(**{user_field: user})

    # 3. USER: Employee, sees only their own data
    return queryset.filter(**{user_field: user})
