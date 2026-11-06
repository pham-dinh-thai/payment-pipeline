import { Customer } from '../../domain/customer.aggregate';
import { MikroCustomer } from '../entities/mikro-customer.entity';

export class CustomerMapper {
  public static toMikroOrm(customer: Customer): MikroCustomer {
    const mikroCustomer = new MikroCustomer();

    mikroCustomer.id = customer.getId();
    mikroCustomer.userId = customer.getUserId();
    mikroCustomer.createdAt = customer.getCreatedAt();
    mikroCustomer.updatedAt = customer.getUpdatedAt();

    return mikroCustomer;
  }
}
