import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  type IAuditLogsRepository,
  AUDIT_LOGS_REPOSITORY,
} from '../../../domain/audit-logs.repository';
import { GetAuditLogQuery } from './get-audit-log.query';
import { AuditLogReadModel } from './audit-log.read-model';

@QueryHandler(GetAuditLogQuery)
export class GetAuditLogHandler implements IQueryHandler<
  GetAuditLogQuery,
  AuditLogReadModel
> {
  public constructor(
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditLogsRepository: IAuditLogsRepository,
  ) {}

  public async execute(query: GetAuditLogQuery): Promise<AuditLogReadModel> {
    const auditLog = await this.auditLogsRepository.findById(query.id);

    if (!auditLog) {
      throw new NotFoundException(`Audit log id ${query.id} not found`);
    }

    return AuditLogReadModel.fromAuditLog(auditLog);
  }
}
