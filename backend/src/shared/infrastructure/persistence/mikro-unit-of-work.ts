import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IUnitOfWork } from '../../application/unit-of-work';

@Injectable()
export class MikroUnitOfWork implements IUnitOfWork {
  public constructor(private readonly entityManager: EntityManager) {}

  public run<T>(work: () => Promise<T>): Promise<T> {
    return this.entityManager.transactional(work);
  }
}
