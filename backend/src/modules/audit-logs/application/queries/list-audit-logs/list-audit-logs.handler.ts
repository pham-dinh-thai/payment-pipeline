import { BadRequestException, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  AUDIT_LOGS_REPOSITORY,
  type IAuditLogsRepository,
} from '../../../domain/audit-logs.repository';
import { ListAuditLogsQuery } from './list-audit-logs.query';
import { AuditLogPageReadModel } from './audit-log-page.read-model';

@QueryHandler(ListAuditLogsQuery)
export class ListAuditLogsHandler implements IQueryHandler<
  ListAuditLogsQuery,
  AuditLogPageReadModel
> {
  public constructor(
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditLogsRepository: IAuditLogsRepository,
  ) {}

  public async execute(
    query: ListAuditLogsQuery,
  ): Promise<AuditLogPageReadModel> {
    const { filters, page, limit } = query;

    if (filters.from && filters.to && filters.from > filters.to) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const result = await this.auditLogsRepository.findPage({
      actorId: filters.actorId,
      actorType: filters.actorType,
      action: filters.action,
      entityType: filters.entityType,
      entityId: filters.entityId,
      status: filters.status,
      from: filters.from,
      to: filters.to,
      limit,
      offset: (page - 1) * limit,
    });

    return AuditLogPageReadModel.fromAuditLogPage(result, page, limit);
  }
}
