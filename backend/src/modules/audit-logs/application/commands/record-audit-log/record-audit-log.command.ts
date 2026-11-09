import { Command } from '@nestjs/cqrs';
import { CreateAuditLogProps } from '../../../domain/audit-log.aggregate';

export class RecordAuditLogCommand extends Command<{ id: string }> {
  public constructor(public readonly props: CreateAuditLogProps) {
    super();
  }
}
