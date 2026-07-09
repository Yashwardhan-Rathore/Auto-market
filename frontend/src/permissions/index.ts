export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type PermissionAction =
  | 'contacts:create' | 'contacts:read' | 'contacts:update' | 'contacts:delete'
  | 'campaigns:create' | 'campaigns:read' | 'campaigns:update' | 'campaigns:delete'
  | 'workflows:create' | 'workflows:read' | 'workflows:update' | 'workflows:delete'
  | 'billing:manage'
  | 'settings:manage';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  OWNER: [
    'contacts:create', 'contacts:read', 'contacts:update', 'contacts:delete',
    'campaigns:create', 'campaigns:read', 'campaigns:update', 'campaigns:delete',
    'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete',
    'billing:manage', 'settings:manage'
  ],
  ADMIN: [
    'contacts:create', 'contacts:read', 'contacts:update', 'contacts:delete',
    'campaigns:create', 'campaigns:read', 'campaigns:update', 'campaigns:delete',
    'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete',
    'settings:manage'
  ],
  MEMBER: [
    'contacts:create', 'contacts:read', 'contacts:update',
    'campaigns:create', 'campaigns:read', 'campaigns:update',
    'workflows:create', 'workflows:read', 'workflows:update' 
  ],
  VIEWER: [
    'contacts:read',
    'campaigns:read',
    'workflows:read'
  ]
};

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(action) : false;
}
