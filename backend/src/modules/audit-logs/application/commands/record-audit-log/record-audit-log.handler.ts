import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IAuditLogsRepository,
  AUDIT_LOGS_REPOSITORY,
} from '../../../domain/audit-logs.repository';
import { AuditLog } from '../../../domain/audit-log.aggregate';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import { RecordAuditLogCommand } from './record-audit-log.command';

@CommandHandler(RecordAuditLogCommand)
export class RecordAuditLogHandler implements ICommandHandler<
  RecordAuditLogCommand,
  { id: string }
> {
  public constructor(
    @Inject(AUDIT_LOGS_REPOSITORY)
    private readonly auditLogsRepository: IAuditLogsRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(command: RecordAuditLogCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const auditLog = AuditLog.create(command.props);

      await this.auditLogsRepository.create(auditLog);

      return { id: auditLog.getId() };
    });
  }
}
