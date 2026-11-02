import { Inject, Injectable } from '@nestjs/common';
import { Command, CommandBus } from '@nestjs/cqrs';
import { type IUnitOfWork, UNIT_OF_WORK } from '../../application/unit-of-work';

/**
 * Bọc mỗi command trong một transaction.
 *
 * Transaction là cross-cutting concern ở tầng dispatch, nên handler
 * không cần biết tới IUnitOfWork hay ORM.
 */
@Injectable()
export class TransactionalCommandBus {
  public constructor(
    private readonly commandBus: CommandBus,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public execute<R = void>(command: Command<R>): Promise<R> {
    return this.unitOfWork.run(() => this.commandBus.execute<R>(command));
  }
}
