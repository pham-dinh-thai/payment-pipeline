import { Injectable } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  AuditLogPage,
  type FindAuditLogsOptions,
  type IAuditLogsRepository,
} from '../../domain/audit-logs.repository';
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

  public async findPage(options: FindAuditLogsOptions): Promise<AuditLogPage> {
    const where: FilterQuery<MikroAuditLog> = {};

    if (options.actorId !== undefined) {
      where.actorId = options.actorId;
    }

    if (options.actorType !== undefined) {
      where.actorType = options.actorType;
    }

    if (options.action !== undefined) {
      where.action = options.action;
    }

    if (options.entityType !== undefined) {
      where.entityType = options.entityType;
    }

    if (options.entityId !== undefined) {
      where.entityId = options.entityId;
    }

    if (options.status !== undefined) {
      where.status = options.status;
    }

    if (options.from || options.to) {
      where.occurredAt = {
        ...(options.from ? { $gte: options.from } : {}),
        ...(options.to ? { $lte: options.to } : {}),
      };
    }

    const [items, total] = await this.entityManager.findAndCount(
      MikroAuditLog,
      where,
      {
        orderBy: { occurredAt: 'desc', id: 'desc' },
        limit: options.limit,
        offset: options.offset,
      },
    );

    return {
      items: items.map((mikroAuditLog) =>
        AuditLogMapper.toDomain(mikroAuditLog),
      ),
      total,
    };
  }

  public async create(auditLog: AuditLog): Promise<AuditLog> {
    const mikroAuditLog = AuditLogMapper.toMikroOrm(auditLog);

    this.entityManager.persist(mikroAuditLog);
    await this.entityManager.flush();

    return AuditLogMapper.toDomain(mikroAuditLog);
  }
}
