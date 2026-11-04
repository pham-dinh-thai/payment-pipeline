import { Supplier } from '../../domain/supplier.aggregate';
import { MikroSupplier } from '../entities/mikro-supplier.entity';

export class SupplierMapper {
  public static toDomain(mikroSupplier: MikroSupplier): Supplier {
    return Supplier.fromPersistent({
      id: mikroSupplier.id,
      code: mikroSupplier.code,
      name: mikroSupplier.name,
      status: mikroSupplier.status,
      phone: mikroSupplier.phone,
      email: mikroSupplier.email,
      address: mikroSupplier.address,
      taxCode: mikroSupplier.taxCode,
      createdAt: mikroSupplier.createdAt,
      updatedAt: mikroSupplier.updatedAt,
    });
  }

  public static toMikro(supplier: Supplier): MikroSupplier {
    return SupplierMapper.assign(new MikroSupplier(), supplier);
  }

  public static assign(
    mikroSupplier: MikroSupplier,
    supplier: Supplier,
  ): MikroSupplier {
    mikroSupplier.id = supplier.getId();
    mikroSupplier.code = supplier.getCode();
    mikroSupplier.name = supplier.getName();
    mikroSupplier.status = supplier.getStatus();
    mikroSupplier.createdAt = supplier.getCreatedAt();
    mikroSupplier.updatedAt = supplier.getUpdatedAt();
    mikroSupplier.phone = supplier.getPhone();
    mikroSupplier.email = supplier.getEmail();
    mikroSupplier.address = supplier.getAddress();
    mikroSupplier.taxCode = supplier.getTaxCode();

    return mikroSupplier;
  }
}
