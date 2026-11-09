import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ActorType } from '../../../domain/enums/actor-type.enum';
import { AuditStatus } from '../../../domain/enums/audit-status.enum';
import { EntityType } from '../../../domain/enums/entity-type.enum';

const trimToUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
};

export class ListAuditLogsRequest {
  @Transform(trimToUndefined)
  @IsOptional()
  @IsUUID('4')
  actorId?: string;

  @IsOptional()
  @IsEnum(ActorType)
  actorType?: ActorType;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
