import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AUDIT_LOGS_REPOSITORY } from './domain/audit-logs.repository';
import { MikroAuditLog } from './infrastructure/entities/mikro-audit-log.entity';
import { MikroAuditLogsRepository } from './infrastructure/repositories/mikro-audit-logs.repository';

@Module({
  imports: [MikroOrmModule.forFeature([MikroAuditLog])],
  providers: [
    {
      provide: AUDIT_LOGS_REPOSITORY,
      useClass: MikroAuditLogsRepository,
    },
  ],
  exports: [AUDIT_LOGS_REPOSITORY],
})
export class AuditLogsModule {}
