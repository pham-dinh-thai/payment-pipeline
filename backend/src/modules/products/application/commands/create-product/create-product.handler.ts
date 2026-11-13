import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command';
import {
  type IProductsRepository,
  PRODUCTS_REPOSITORY,
} from '../../../domain/products.repository';
import { Inject } from '@nestjs/common';
import { Product } from '../../../domain/product.aggregate';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
} from '../../../../../shared/modules/unit-of-work/unit-of-work';
import {
  type IOutboxRepository,
  OUTBOX_REPOSITORY,
} from '../../../../../shared/modules/outbox/domain/outbox.repository';
import { PRODUCT_CREATED_EVENT } from '../../../domain/events/product-created.event';
import { auditEventPayload } from '../../../../audit-logs/domain/events/audit-event.payload';
import { EntityType } from '../../../../audit-logs/domain/enums/entity-type.enum';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  public constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,

    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(command: CreateProductCommand): Promise<{ id: string }> {
    return this.unitOfWork.run(async () => {
      const product = Product.create({
        name: command.name,
        unitPrice: command.unitPrice,
        quantity: command.quantity,
      });

      await this.productsRepository.create(product);

      await this.outboxRepository.create({
        eventType: PRODUCT_CREATED_EVENT,
        payload: auditEventPayload(command.headers, {
          entityType: EntityType.PRODUCTS,
          entityId: product.getId(),
          after: {
            name: product.getName(),
            unitPrice: product.getUnitPrice(),
            quantity: product.getQuantity(),
          },
        }),
      });

      return { id: product.getId() };
    });
  }
}
