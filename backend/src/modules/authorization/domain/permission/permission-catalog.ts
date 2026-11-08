// Source of truth for every permission the application enforces.
// Add an action here only when there is code (guard/policy) that checks it.
// `manage` is a reserved wildcard and must not be listed here.
export const PERMISSIONS = {
  accounts: ['read', 'update'],
  users: ['create', 'read', 'update', 'delete'],
  customers: ['create', 'read', 'update', 'delete'],
  roles: ['create', 'read', 'update', 'delete'],
  orders: ['read', 'process', 'cancel', 'refund'],
  reports: ['view_sales', 'view_inventory', 'export'],
} as const;

export const MANAGE_ACTION = 'manage' as const;

export type Resource = keyof typeof PERMISSIONS;

export type ActionOf<R extends Resource> = (typeof PERMISSIONS)[R][number];

export type ConcretePermissionKey = {
  [R in Resource]: `${R}:${ActionOf<R>}`;
}[Resource];

export type ManagePermissionKey = `${Resource}:${typeof MANAGE_ACTION}`;

export type PermissionKey = ConcretePermissionKey | ManagePermissionKey;

export function isResource(value: string): value is Resource {
  return Object.prototype.hasOwnProperty.call(PERMISSIONS, value);
}

export function isActionAllowed(resource: Resource, action: string): boolean {
  return (PERMISSIONS[resource] as readonly string[]).includes(action);
}
