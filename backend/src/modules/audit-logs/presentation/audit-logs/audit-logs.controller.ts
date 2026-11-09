import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '../../../../shared/infrastructure/security/auth.guard';
import { GetAuditLogQuery } from '../../application/queries/get-audit-log/get-audit-log.query';
import { AuditLogReadModel } from '../../application/queries/get-audit-log/audit-log.read-model';
import { ListAuditLogsQuery } from '../../application/queries/list-audit-logs/list-audit-logs.query';
import { AuditLogPageReadModel } from '../../application/queries/list-audit-logs/audit-log-page.read-model';
import { ListAuditLogsRequest } from './requests/list-audit-logs.request';

@UseGuards(AuthGuard)
@Controller('audit-logs')
export class AuditLogsController {
  public constructor(private readonly queryBus: QueryBus) {}

  @Get()
  public findAll(
    @Query() request: ListAuditLogsRequest,
  ): Promise<AuditLogPageReadModel> {
    return this.queryBus.execute(
      new ListAuditLogsQuery({
        actorId: request.actorId,
        actorType: request.actorType,
        action: request.action,
        entityType: request.entityType,
        entityId: request.entityId,
        status: request.status,
        from: request.from ? new Date(request.from) : undefined,
        to: request.to ? new Date(request.to) : undefined,
        page: request.page,
        limit: request.limit,
      }),
    );
  }

  @Get(':id')
  public findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<AuditLogReadModel> {
    return this.queryBus.execute(new GetAuditLogQuery(id));
  }
}
