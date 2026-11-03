import { Supplier } from '../../domain/supplier.aggregate';
import { MikroSupplier } from '../entities/mikro-supplier.entity';

export class SupplierMapper {
  public static toMikro(supplier: Supplier): MikroSupplier {
    const mikroSupplier = new MikroSupplier();

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
