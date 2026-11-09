import { AuditLogPage } from '../../../domain/audit-logs.repository';
import { AuditLogListItemReadModel } from './audit-log-list-item.read-model';

export class AuditLogPageReadModel {
  public constructor(
    public readonly items: AuditLogListItemReadModel[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}

  public static fromAuditLogPage(
    result: AuditLogPage,
    page: number,
    limit: number,
  ): AuditLogPageReadModel {
    return new AuditLogPageReadModel(
      result.items.map((auditLog) =>
        AuditLogListItemReadModel.fromAuditLog(auditLog),
      ),
      result.total,
      page,
      limit,
    );
  }
}
