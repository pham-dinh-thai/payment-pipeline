import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { SecurityModule } from '../../shared/modules/security/security.module';
import { AUDIT_LOGS_REPOSITORY } from './domain/audit-logs.repository';
import { MikroAuditLog } from './infrastructure/entities/mikro-audit-log.entity';
import { MikroAuditLogsRepository } from './infrastructure/repositories/mikro-audit-logs.repository';
import { RecordAuditLogHandler } from './application/commands/record-audit-log/record-audit-log.handler';
import { GetAuditLogHandler } from './application/queries/get-audit-log/get-audit-log.handler';
import { ListAuditLogsHandler } from './application/queries/list-audit-logs/list-audit-logs.handler';
import { AuditLogsController } from './presentation/audit-logs/audit-logs.controller';
import { OutBoxModule } from '../../shared/modules/outbox/outbox.module';
import { AuditLogConsumer } from './application/consumers/audit-log.consumer';

@Module({
  imports: [
    MikroOrmModule.forFeature([MikroAuditLog]),
    SecurityModule,
    OutBoxModule,
  ],
  controllers: [AuditLogsController],
  providers: [
    {
      provide: AUDIT_LOGS_REPOSITORY,
      useClass: MikroAuditLogsRepository,
    },
    RecordAuditLogHandler,
    GetAuditLogHandler,
    ListAuditLogsHandler,
    AuditLogConsumer,
  ],
  exports: [AUDIT_LOGS_REPOSITORY],
})
export class AuditLogsModule {}
