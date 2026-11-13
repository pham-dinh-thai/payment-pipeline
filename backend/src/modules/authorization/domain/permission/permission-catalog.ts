export const PERMISSIONS = {
  accounts: ['read', 'update'],
  users: ['create', 'read', 'update', 'delete'],
  customers: ['create', 'read', 'update', 'delete'],
  roles: ['create', 'read', 'update', 'delete'],
  orders: ['read', 'process', 'cancel', 'refund'],
  products: ['read', 'create', 'update', 'delete'],
  suppliers: ['read', 'create', 'update', 'delete'],
  goods_receipts: ['read', 'create', 'confirm', 'cancel'],
  inventories: ['read', 'issue', 'reconcile'],
  audit_logs: ['read'],
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
  return Object.keys(PERMISSIONS).includes(value);
}

export function isActionAllowed(resource: Resource, action: string): boolean {
  return (PERMISSIONS[resource] as readonly string[]).includes(action);
}

export function parsePermissionKey(
  value: string,
): { resource: Resource; action: string } | null {
  const separator = value.indexOf(':');

  if (separator === -1) {
    return null;
  }

  const resource = value.slice(0, separator);
  const action = value.slice(separator + 1);

  if (!isResource(resource)) {
    return null;
  }

  if (action !== MANAGE_ACTION && !isActionAllowed(resource, action)) {
    return null;
  }

  return { resource, action };
}

export function isPermissionKey(value: string): value is PermissionKey {
  return parsePermissionKey(value) !== null;
}

export function permissionMatches(
  granted: PermissionKey,
  resource: Resource,
  action: string,
): boolean {
  const parsed = parsePermissionKey(granted);

  if (!parsed || parsed.resource !== resource) {
    return false;
  }

  return parsed.action === MANAGE_ACTION || parsed.action === action;
}
