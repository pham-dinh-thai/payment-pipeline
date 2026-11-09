import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UNIT_OF_WORK } from '../../shared/application/unit-of-work';
import { MikroUnitOfWork } from '../../shared/infrastructure/persistence/mikro-unit-of-work';
import { SecurityModule } from '../../shared/infrastructure/security/security.module';
import { AUDIT_LOGS_REPOSITORY } from './domain/audit-logs.repository';
import { MikroAuditLog } from './infrastructure/entities/mikro-audit-log.entity';
import { MikroAuditLogsRepository } from './infrastructure/repositories/mikro-audit-logs.repository';
import { RecordAuditLogHandler } from './application/commands/record-audit-log/record-audit-log.handler';
import { GetAuditLogHandler } from './application/queries/get-audit-log/get-audit-log.handler';
import { ListAuditLogsHandler } from './application/queries/list-audit-logs/list-audit-logs.handler';
import { AuditLogsController } from './presentation/audit-logs/audit-logs.controller';

@Module({
  imports: [MikroOrmModule.forFeature([MikroAuditLog]), SecurityModule],
  controllers: [AuditLogsController],
  providers: [
    {
      provide: AUDIT_LOGS_REPOSITORY,
      useClass: MikroAuditLogsRepository,
    },
    { provide: UNIT_OF_WORK, useClass: MikroUnitOfWork },
    RecordAuditLogHandler,
    GetAuditLogHandler,
    ListAuditLogsHandler,
  ],
  exports: [AUDIT_LOGS_REPOSITORY],
})
export class AuditLogsModule {}
