import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { type IAuditLogsRepository } from '../../domain/audit-logs.repository';
import { AuditLog } from '../../domain/audit-log.aggregate';
import { EntityType } from '../../domain/enums/entity-type.enum';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { MikroAuditLog } from '../entities/mikro-audit-log.entity';

@Injectable()
export class MikroAuditLogsRepository implements IAuditLogsRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findById(id: string): Promise<AuditLog | null> {
    const mikroAuditLog = await this.entityManager.findOne(MikroAuditLog, {
      id,
    });

    return mikroAuditLog ? AuditLogMapper.toDomain(mikroAuditLog) : null;
  }

  public async findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<AuditLog[]> {
    const mikroAuditLogs = await this.entityManager.find(
      MikroAuditLog,
      { entityType, entityId },
      { orderBy: { occurredAt: 'desc', id: 'desc' } },
    );

    return mikroAuditLogs.map((mikroAuditLog) =>
      AuditLogMapper.toDomain(mikroAuditLog),
    );
  }

  public async create(auditLog: AuditLog): Promise<AuditLog> {
    const mikroAuditLog = AuditLogMapper.toMikroOrm(auditLog);

    this.entityManager.persist(mikroAuditLog);
    await this.entityManager.flush();

    return AuditLogMapper.toDomain(mikroAuditLog);
  }
}
