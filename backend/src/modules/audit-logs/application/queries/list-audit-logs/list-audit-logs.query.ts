import { Query } from '@nestjs/cqrs';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../../domain/enums/audit-status.enum';
import { EntityType } from '../../../domain/enums/entity-type.enum';
import { AuditLogPageReadModel } from './audit-log-page.read-model';

export type ListAuditLogsQueryProps = {
  actorId?: string;
  actorType?: ActorType;
  action?: string;
  entityType?: EntityType;
  entityId?: string;
  status?: AuditStatus;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
};

export class ListAuditLogsQuery extends Query<AuditLogPageReadModel> {
  public readonly page: number;
  public readonly limit: number;

  public constructor(public readonly filters: ListAuditLogsQueryProps = {}) {
    super();

    this.page = Math.max(1, filters.page ?? 1);
    this.limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  }
}
