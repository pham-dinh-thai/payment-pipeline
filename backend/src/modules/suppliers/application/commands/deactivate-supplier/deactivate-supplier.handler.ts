import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateSupplierCommand } from './deactivate-supplier.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type ISuppliersRepository,
  SUPPLIERS_REPOSITORY,
} from '../../../domain/suppliers.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/application/unit-of-work';

@CommandHandler(DeactivateSupplierCommand)
export class DeactivateSupplierHandler implements ICommandHandler<DeactivateSupplierCommand> {
  public constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepository: ISuppliersRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: DeactivateSupplierCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const supplier = await this.suppliersRepository.findById(command.id);

      if (!supplier) {
        throw new NotFoundException(`Supplier id ${command.id} not found`);
      }

      supplier.deactivate();

      await this.suppliersRepository.update(supplier);

      return { id: supplier.getId() };
    });
  }
}
