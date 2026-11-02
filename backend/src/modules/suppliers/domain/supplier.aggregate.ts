import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { SupplierStatus } from './enums/supplier-status.enum';
import { Phone } from './value-objects/phone.value-object';
import { SupplierCode } from './value-objects/supplier-code.value-object';
import { SupplierName } from './value-objects/supplier-name.value-object';

export type CreateSupplierProps = {
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
};

export type FromPersistentSupplierProps = {
  id: string;
  code: string;
  name: string;
  status: SupplierStatus;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const normalizeOptional = (value?: string | null): string | null => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

const toPhone = (value?: string | null): Phone | null => {
  const normalized = normalizeOptional(value);

  return normalized ? Phone.create(normalized) : null;
};

export class Supplier {
  private constructor(
    private readonly id: Id,
    private readonly code: SupplierCode,
    private name: SupplierName,
    private status: SupplierStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private phone: Phone | null,
    private email: string | null,
    private address: string | null,
    private taxCode: string | null,
  ) {}

  public static create(props: CreateSupplierProps): Supplier {
    const now = new Date();

    return new Supplier(
      Id.generate(),
      SupplierCode.create(props.code),
      SupplierName.create(props.name),
      SupplierStatus.ACTIVE,
      now,
      now,
      toPhone(props.phone),
      normalizeOptional(props.email),
      normalizeOptional(props.address),
      normalizeOptional(props.taxCode),
    );
  }

  public static fromPersistent(props: FromPersistentSupplierProps): Supplier {
    return new Supplier(
      Id.create(props.id),
      SupplierCode.create(props.code),
      SupplierName.create(props.name),
      props.status,
      props.createdAt,
      props.updatedAt,
      toPhone(props.phone),
      normalizeOptional(props.email),
      normalizeOptional(props.address),
      normalizeOptional(props.taxCode),
    );
  }

  public activate(): void {
    this.status = SupplierStatus.ACTIVE;

    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.status = SupplierStatus.INACTIVE;

    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === SupplierStatus.ACTIVE;
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getCode(): string {
    return this.code.getValue();
  }

  public getName(): string {
    return this.name.getValue();
  }

  public getStatus(): SupplierStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  public getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  public getPhone(): string | null {
    return this.phone?.getValue() ?? null;
  }

  public getEmail(): string | null {
    return this.email;
  }

  public getAddress(): string | null {
    return this.address;
  }

  public getTaxCode(): string | null {
    return this.taxCode;
  }
}
