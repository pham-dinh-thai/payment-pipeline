import { UnprocessableEntityException } from '@nestjs/common';
import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { ActorType } from './enums/actor-type.enum';
import { AuditStatus } from './enums/audit-status.enum';
import { EntityType } from './enums/entity-type.enum';

const MAX_ACTION_LENGTH = 100;
const MAX_ACTOR_ID_LENGTH = 255;
const MAX_ACTOR_LABEL_LENGTH = 255;
const MAX_ENTITY_ID_LENGTH = 255;
const MAX_IP_ADDRESS_LENGTH = 45;
const MAX_USER_AGENT_LENGTH = 512;
const MAX_REQUEST_ID_LENGTH = 100;
const MAX_REASON_LENGTH = 1000;
const MAX_ERROR_CODE_LENGTH = 100;
const MAX_ERROR_MESSAGE_LENGTH = 2000;

export type AuditSnapshot = Record<string, unknown>;

export type CreateAuditLogProps = {
  occurredAt?: Date;
  actorId?: string | null;
  actorType?: ActorType;
  actorLabel?: string | null;
  action: string;
  entityType?: EntityType | null;
  entityId?: string | null;
  status?: AuditStatus;
  before?: AuditSnapshot | null;
  after?: AuditSnapshot | null;
  metadata?: AuditSnapshot;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  reason?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type FromPersistentAuditLogProps = {
  id: string;
  occurredAt: Date;
  actorId: string | null;
  actorType: ActorType;
  actorLabel: string | null;
  action: string;
  entityType: EntityType | null;
  entityId: string | null;
  status: AuditStatus;
  before: AuditSnapshot | null;
  after: AuditSnapshot | null;
  metadata: AuditSnapshot;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  reason: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export class AuditLog {
  private constructor(
    private readonly id: Id,
    private readonly occurredAt: Date,
    private readonly actorId: string | null,
    private readonly actorType: ActorType,
    private readonly actorLabel: string | null,
    private readonly action: string,
    private readonly entityType: EntityType | null,
    private readonly entityId: string | null,
    private readonly status: AuditStatus,
    private readonly before: AuditSnapshot | null,
    private readonly after: AuditSnapshot | null,
    private readonly metadata: AuditSnapshot,
    private readonly ipAddress: string | null,
    private readonly userAgent: string | null,
    private readonly requestId: string | null,
    private readonly reason: string | null,
    private readonly errorCode: string | null,
    private readonly errorMessage: string | null,
  ) {}

  public static create(props: CreateAuditLogProps): AuditLog {
    const actorId = AuditLog.normalizeOptionalString(
      props.actorId,
      MAX_ACTOR_ID_LENGTH,
      'actorId',
    );
    const actorType =
      props.actorType ?? (actorId ? ActorType.USER : ActorType.SYSTEM);
    const before = props.before ?? null;
    const after = props.after ?? null;
    const metadata = props.metadata ?? {};

    AuditLog.assertSnapshot(before, 'before');
    AuditLog.assertSnapshot(after, 'after');
    AuditLog.assertSnapshot(metadata, 'metadata');

    return new AuditLog(
      Id.generate(),
      AuditLog.normalizeOccurredAt(props.occurredAt),
      actorId,
      actorType,
      AuditLog.normalizeOptionalString(
        props.actorLabel,
        MAX_ACTOR_LABEL_LENGTH,
        'actorLabel',
      ),
      AuditLog.normalizeRequiredString(
        props.action,
        MAX_ACTION_LENGTH,
        'action',
      ),
      props.entityType ?? null,
      AuditLog.normalizeOptionalString(
        props.entityId,
        MAX_ENTITY_ID_LENGTH,
        'entityId',
      ),
      props.status ?? AuditStatus.SUCCESS,
      before,
      after,
      metadata,
      AuditLog.normalizeOptionalString(
        props.ipAddress,
        MAX_IP_ADDRESS_LENGTH,
        'ipAddress',
      ),
      AuditLog.normalizeOptionalString(
        props.userAgent,
        MAX_USER_AGENT_LENGTH,
        'userAgent',
      ),
      AuditLog.normalizeOptionalString(
        props.requestId,
        MAX_REQUEST_ID_LENGTH,
        'requestId',
      ),
      AuditLog.normalizeOptionalString(
        props.reason,
        MAX_REASON_LENGTH,
        'reason',
      ),
      AuditLog.normalizeOptionalString(
        props.errorCode,
        MAX_ERROR_CODE_LENGTH,
        'errorCode',
      ),
      AuditLog.normalizeOptionalString(
        props.errorMessage,
        MAX_ERROR_MESSAGE_LENGTH,
        'errorMessage',
      ),
    );
  }

  public static fromPersistent(props: FromPersistentAuditLogProps): AuditLog {
    return new AuditLog(
      Id.create(props.id),
      props.occurredAt,
      props.actorId,
      props.actorType,
      props.actorLabel,
      props.action,
      props.entityType,
      props.entityId,
      props.status,
      props.before,
      props.after,
      props.metadata,
      props.ipAddress,
      props.userAgent,
      props.requestId,
      props.reason,
      props.errorCode,
      props.errorMessage,
    );
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getOccurredAt(): Date {
    return this.occurredAt;
  }

  public getActorId(): string | null {
    return this.actorId;
  }

  public getActorType(): ActorType {
    return this.actorType;
  }

  public getActorLabel(): string | null {
    return this.actorLabel;
  }

  public getAction(): string {
    return this.action;
  }

  public getEntityType(): EntityType | null {
    return this.entityType;
  }

  public getEntityId(): string | null {
    return this.entityId;
  }

  public getStatus(): AuditStatus {
    return this.status;
  }

  public getBefore(): AuditSnapshot | null {
    return this.before;
  }

  public getAfter(): AuditSnapshot | null {
    return this.after;
  }

  public getMetadata(): AuditSnapshot {
    return this.metadata;
  }

  public getIpAddress(): string | null {
    return this.ipAddress;
  }

  public getUserAgent(): string | null {
    return this.userAgent;
  }

  public getRequestId(): string | null {
    return this.requestId;
  }

  public getReason(): string | null {
    return this.reason;
  }

  public getErrorCode(): string | null {
    return this.errorCode;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  private static normalizeOccurredAt(occurredAt?: Date): Date {
    if (!occurredAt) {
      return new Date();
    }

    if (Number.isNaN(occurredAt.getTime())) {
      throw new UnprocessableEntityException(
        'Audit log occurredAt must be a valid date',
      );
    }

    return occurredAt;
  }

  private static normalizeRequiredString(
    raw: string,
    maxLength: number,
    field: string,
  ): string {
    const value = raw?.trim();

    if (!value) {
      throw new UnprocessableEntityException(`Audit log ${field} is required`);
    }

    if (value.length > maxLength) {
      throw new UnprocessableEntityException(
        `Audit log ${field} must have at most ${maxLength} characters`,
      );
    }

    return value;
  }

  private static normalizeOptionalString(
    raw: string | null | undefined,
    maxLength: number,
    field: string,
  ): string | null {
    const value = raw?.trim();

    if (!value) {
      return null;
    }

    if (value.length > maxLength) {
      throw new UnprocessableEntityException(
        `Audit log ${field} must have at most ${maxLength} characters`,
      );
    }

    return value;
  }

  private static assertSnapshot(
    snapshot: AuditSnapshot | null,
    field: string,
  ): void {
    if (snapshot === null) {
      return;
    }

    if (typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      throw new UnprocessableEntityException(
        `Audit log ${field} must be a JSON object`,
      );
    }

    AuditLog.assertJsonSafe(snapshot, field, new Set());
  }

  private static assertJsonSafe(
    value: unknown,
    path: string,
    ancestors: Set<object>,
  ): void {
    if (value === null) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
      return;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new UnprocessableEntityException(
          `Audit log ${path} must be JSON-serializable`,
        );
      }

      return;
    }

    if (typeof value !== 'object') {
      throw new UnprocessableEntityException(
        `Audit log ${path} must be JSON-serializable`,
      );
    }

    if (value instanceof Date) {
      return;
    }

    if (ancestors.has(value)) {
      throw new UnprocessableEntityException(
        `Audit log ${path} must not contain circular references`,
      );
    }

    ancestors.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        AuditLog.assertJsonSafe(item, `${path}[${index}]`, ancestors),
      );
    } else {
      Object.entries(value).forEach(([key, item]) =>
        AuditLog.assertJsonSafe(item, `${path}.${key}`, ancestors),
      );
    }

    ancestors.delete(value);
  }
}
