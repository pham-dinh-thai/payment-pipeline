import { SupplierStatus } from '../../../domain/enums/supplier-status.enum';

export class SupplierListItemReadModel {
  public constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly status: SupplierStatus,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly taxCode: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
