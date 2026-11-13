import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  type ISuppliersRepository,
  SUPPLIERS_REPOSITORY,
} from '../../../domain/suppliers.repository';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { ActivateSupplierCommand } from './activate-supplier.command';
import { SUPPLIER_ACTIVATED_EVENT } from '../../../domain/events/supplier-activated.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(ActivateSupplierCommand)
export class ActivateSupplierHandler implements ICommandHandler<ActivateSupplierCommand> {
  public constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepository: ISuppliersRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(
    command: ActivateSupplierCommand,
  ): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const supplier = await this.suppliersRepository.findById(command.id);

      if (!supplier) {
        throw new NotFoundException(`Supplier id ${command.id} not found`);
      }

      const previousStatus = supplier.getStatus();

      supplier.activate();

      await this.suppliersRepository.update(supplier);

      await this.outboxRepository.create({
        eventType: SUPPLIER_ACTIVATED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.SUPPLIERS,
          entityId: supplier.getId(),
          before: { status: previousStatus },
          after: { status: supplier.getStatus() },
        }),
      });

      return { id: supplier.getId() };
    });
  }
}
