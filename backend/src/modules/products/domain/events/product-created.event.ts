import type { AuditEventPayload } from '../../../audit-logs/domain/events/audit-event.payload';

export const PRODUCT_CREATED_EVENT = 'product.created';

export type ProductCreatedPayload = AuditEventPayload;
