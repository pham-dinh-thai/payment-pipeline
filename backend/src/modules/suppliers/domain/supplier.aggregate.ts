import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { SupplierStatus } from './enums/supplier-status.enum';
import { Phone } from './value-objects/phone.value-object';

export class Supplier {
  private constructor(
    private readonly id: Id,
    private readonly code: string,
    private name: string,
    private status: SupplierStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private phone: Phone | null,
    private email: string | null,
    private address: string | null,
    private taxCode: string | null,
  ) {}

  public getId(): string {
    return this.id.getValue();
  }

  public getCode(): string {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getStatus(): SupplierStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getPhone(): Phone | null {
    return this.phone;
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
