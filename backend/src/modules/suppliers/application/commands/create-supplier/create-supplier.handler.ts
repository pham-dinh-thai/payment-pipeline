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
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { SUPPLIER_CREATED_EVENT } from '../../../domain/events/supplier-created.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(CreateSupplierCommand)
export class CreateSupplierHandler implements ICommandHandler<CreateSupplierCommand> {
  public constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepository: ISuppliersRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

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

      await this.suppliersRepository.create(supplier);

      await this.outboxRepository.create({
        eventType: SUPPLIER_CREATED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.SUPPLIERS,
          entityId: supplier.getId(),
          after: {
            code: supplier.getCode(),
            name: supplier.getName(),
            status: supplier.getStatus(),
            phone: supplier.getPhone(),
            email: supplier.getEmail(),
            address: supplier.getAddress(),
            taxCode: supplier.getTaxCode(),
          },
        }),
      });

      return { id: supplier.getId() };
    });
  }
}
