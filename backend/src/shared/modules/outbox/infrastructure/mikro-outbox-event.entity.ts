import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'outbox_events' })
export class MikroOutBoxEvent {
  @PrimaryKey({ type: 'integer', autoincrement: true })
  id!: number;

  @Property({ type: 'string' })
  eventType!: string;

  @Property({ type: 'json' })
  payload!: Record<string, unknown>;

  @Property({ type: 'timestamptz' })
  createdAt = new Date();

  @Property({ type: 'boolean' })
  processed = false;

  @Property({ type: 'integer' })
  attempts = 0;

  @Property({ type: 'text', nullable: true })
  lastError: string | null = null;

  @Property({ type: 'timestamptz', nullable: true })
  failedAt: Date | null = null;
}
