import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { SupplierStatus } from './enums/supplier-status.enum';
import { SupplierCode } from './value-objects/supplier-code.value-object';
import { SupplierPhone } from './value-objects/supplier-phone.value-object';

export type CreateSupplierProps = {
  sequence: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
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

export type UpdateSupplierProps = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
};

export class Supplier {
  private constructor(
    private readonly id: Id,
    private readonly code: SupplierCode,
    private name: string,
    private status: SupplierStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private phone: SupplierPhone | null,
    private email: string | null,
    private address: string | null,
    private taxCode: string | null,
  ) {}

  public static create(props: CreateSupplierProps): Supplier {
    const now = new Date();

    return new Supplier(
      Id.generate(),
      SupplierCode.fromNumber(props.sequence),
      props.name,
      SupplierStatus.ACTIVE,
      now,
      now,
      props.phone ? SupplierPhone.create(props.phone) : null,
      props.email,
      props.address,
      props.taxCode,
    );
  }

  public static fromPersistent(props: FromPersistentSupplierProps): Supplier {
    return new Supplier(
      Id.create(props.id),
      SupplierCode.create(props.code),
      props.name,
      props.status,
      props.createdAt,
      props.updatedAt,
      props.phone ? SupplierPhone.create(props.phone) : null,
      props.email,
      props.address,
      props.taxCode,
    );
  }

  public update(props: UpdateSupplierProps): void {
    this.name = props.name;
    this.phone = props.phone ? SupplierPhone.create(props.phone) : null;
    this.email = props.email;
    this.address = props.address;
    this.taxCode = props.taxCode;

    this.updatedAt = new Date();
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
    return this.name;
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
