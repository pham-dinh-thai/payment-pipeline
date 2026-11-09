import { Query } from '@nestjs/cqrs';
import { AuditLogReadModel } from './audit-log.read-model';

export class GetAuditLogQuery extends Query<AuditLogReadModel> {
  public constructor(public readonly id: string) {
    super();
  }
}
