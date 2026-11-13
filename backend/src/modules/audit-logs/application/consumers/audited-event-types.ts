import { ROLE_CREATED_EVENT } from '../../../authorization/domain/events/role-created.event';
import { PERMISSION_GRANTED_EVENT } from '../../../authorization/domain/events/permission-granted.event';
import { ROLE_RENAMED_EVENT } from '../../../authorization/domain/events/role-renamed.event';
import { ROLE_REVOKED_EVENT } from '../../../authorization/domain/events/role-revoked.event';
import { SUPER_ADMIN_SET_EVENT } from '../../../authorization/domain/events/super-admin-set.event';
import { ACCOUNT_SIGNED_UP_EVENT } from '../../../authentication/domain/events/account-signed-up.event';
import { ACCOUNT_SIGNED_IN_EVENT } from '../../../authentication/domain/events/account-signed-in.event';
import { USER_CREATED_EVENT } from '../../../users/domain/events/user-created.event';
import { USER_EMAIL_CHANGED_EVENT } from '../../../users/domain/events/user-email-changed.event';
import { USER_ROLE_ASSIGNED_EVENT } from '../../../users/domain/events/user-role-assigned.event';
import { USER_ROLE_REMOVED_EVENT } from '../../../users/domain/events/user-role-removed.event';
import { PRODUCT_CREATED_EVENT } from '../../../products/domain/events/product-created.event';
import { SUPPLIER_CREATED_EVENT } from '../../../suppliers/domain/events/supplier-created.event';
import { SUPPLIER_UPDATED_EVENT } from '../../../suppliers/domain/events/supplier-updated.event';
import { SUPPLIER_ACTIVATED_EVENT } from '../../../suppliers/domain/events/supplier-activated.event';
import { SUPPLIER_DEACTIVATED_EVENT } from '../../../suppliers/domain/events/supplier-deactivated.event';
import { GOODS_RECEIPT_CREATED_EVENT } from '../../../goods-receipts/domain/events/goods-receipt-created.event';
import { GOODS_RECEIPT_CONFIRMED_EVENT } from '../../../goods-receipts/domain/events/goods-receipt-confirmed.event';
import { GOODS_RECEIPT_CANCELLED_EVENT } from '../../../goods-receipts/domain/events/goods-receipt-cancelled.event';
import { INVENTORY_STOCK_ISSUED_EVENT } from '../../../inventories/domain/events/inventory-stock-issued.event';
import { INVENTORY_STOCK_RECONCILED_EVENT } from '../../../inventories/domain/events/inventory-stock-reconciled.event';

/**
 * Verbs stored in `audit_logs.action`. The outbox event type identifies the
 * message and its consumer; the action describes what the actor did.
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'rename'
  | 'grant_permission'
  | 'revoke_permission'
  | 'set_super_admin'
  | 'sign_up'
  | 'sign_in'
  | 'change_email'
  | 'assign_role'
  | 'remove_role'
  | 'activate'
  | 'deactivate'
  | 'confirm'
  | 'cancel'
  | 'issue'
  | 'reconcile';

/**
 * Event types persisted as audit rows, mapped to the action they record.
 * Adding an audited event only requires one entry here; the consumer itself
 * is generic.
 */
export const AUDITED_EVENT_ACTIONS = {
  [ROLE_CREATED_EVENT]: 'create',
  [PERMISSION_GRANTED_EVENT]: 'grant_permission',
  [ROLE_RENAMED_EVENT]: 'rename',
  [ROLE_REVOKED_EVENT]: 'revoke_permission',
  [SUPER_ADMIN_SET_EVENT]: 'set_super_admin',
  [ACCOUNT_SIGNED_UP_EVENT]: 'sign_up',
  [ACCOUNT_SIGNED_IN_EVENT]: 'sign_in',
  [USER_CREATED_EVENT]: 'create',
  [USER_EMAIL_CHANGED_EVENT]: 'change_email',
  [USER_ROLE_ASSIGNED_EVENT]: 'assign_role',
  [USER_ROLE_REMOVED_EVENT]: 'remove_role',
  [PRODUCT_CREATED_EVENT]: 'create',
  [SUPPLIER_CREATED_EVENT]: 'create',
  [SUPPLIER_UPDATED_EVENT]: 'update',
  [SUPPLIER_ACTIVATED_EVENT]: 'activate',
  [SUPPLIER_DEACTIVATED_EVENT]: 'deactivate',
  [GOODS_RECEIPT_CREATED_EVENT]: 'create',
  [GOODS_RECEIPT_CONFIRMED_EVENT]: 'confirm',
  [GOODS_RECEIPT_CANCELLED_EVENT]: 'cancel',
  [INVENTORY_STOCK_ISSUED_EVENT]: 'issue',
  [INVENTORY_STOCK_RECONCILED_EVENT]: 'reconcile',
} as const satisfies Record<string, AuditAction>;

export type AuditedEventType = keyof typeof AUDITED_EVENT_ACTIONS;

export const AUDITED_EVENT_TYPES: readonly AuditedEventType[] = Object.keys(
  AUDITED_EVENT_ACTIONS,
) as AuditedEventType[];

export function auditActionOf(eventType: string): AuditAction | undefined {
  return (AUDITED_EVENT_ACTIONS as Record<string, AuditAction>)[eventType];
}
