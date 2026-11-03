import { ConflictException, Injectable } from '@nestjs/common';
import { ISuppliersRepository } from '../../domain/suppliers.repository';
import { Supplier } from '../../domain/supplier.aggregate';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { SupplierMapper } from '../mappers/supplier.mapper';

@Injectable()
export class MikroSuppliersRepository implements ISuppliersRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async nextSequence(): Promise<number> {
    const rows = (await this.entityManager
      .getConnection()
      .execute(`select nextval('supplier_code_seq') as nextval`)) as {
      nextval: string;
    }[];

    return Number(rows[0].nextval);
  }

  public async save(supplier: Supplier): Promise<Supplier> {
    const mikroSupplier = SupplierMapper.toMikro(supplier);

    try {
      this.entityManager.persist(mikroSupplier);
      await this.entityManager.flush();

      return supplier;
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException('Supplier code or tax code already exists');
      }

      throw e;
    }
  }
}
