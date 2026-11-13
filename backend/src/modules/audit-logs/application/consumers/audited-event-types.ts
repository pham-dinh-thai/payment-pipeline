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
 * Event types persisted as audit rows. Adding an audited event only requires
 * one line here; the consumer itself is generic.
 */
export const AUDITED_EVENT_TYPES: readonly string[] = [
  ROLE_CREATED_EVENT,
  PERMISSION_GRANTED_EVENT,
  ROLE_RENAMED_EVENT,
  ROLE_REVOKED_EVENT,
  SUPER_ADMIN_SET_EVENT,
  ACCOUNT_SIGNED_UP_EVENT,
  ACCOUNT_SIGNED_IN_EVENT,
  USER_CREATED_EVENT,
  USER_EMAIL_CHANGED_EVENT,
  USER_ROLE_ASSIGNED_EVENT,
  USER_ROLE_REMOVED_EVENT,
  PRODUCT_CREATED_EVENT,
  SUPPLIER_CREATED_EVENT,
  SUPPLIER_UPDATED_EVENT,
  SUPPLIER_ACTIVATED_EVENT,
  SUPPLIER_DEACTIVATED_EVENT,
  GOODS_RECEIPT_CREATED_EVENT,
  GOODS_RECEIPT_CONFIRMED_EVENT,
  GOODS_RECEIPT_CANCELLED_EVENT,
  INVENTORY_STOCK_ISSUED_EVENT,
  INVENTORY_STOCK_RECONCILED_EVENT,
];
