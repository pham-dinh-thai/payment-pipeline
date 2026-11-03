import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSupplierCommand } from './create-supplier.command';
import { Inject } from '@nestjs/common';
import {
  type ISuppliersRepository,
  SUPPLIERS_REPOSITORY,
} from '../../../domain/suppliers.repository';
import { Supplier } from '../../../domain/supplier.aggregate';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierHandler implements ICommandHandler<CreateSupplierCommand> {
  public constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepository: ISuppliersRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute(command: CreateSupplierCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const sequence = await this.suppliersRepository.nextSequence();

      const supplier = Supplier.create({
        sequence,
        name: command.name,
        phone: command.phone,
        email: command.email,
        address: command.address,
        taxCode: command.taxCode,
      });

      await this.suppliersRepository.save(supplier);

      return { id: supplier.getId() };
    });
  }
}
