import { ConflictException, Injectable } from '@nestjs/common';
import { ISuppliersRepository } from '../../domain/suppliers.repository';
import { Supplier } from '../../domain/supplier.aggregate';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { SupplierMapper } from '../mappers/supplier.mapper';
import { MikroSupplier } from '../entities/mikro-supplier.entity';

@Injectable()
export class MikroSuppliersRepository implements ISuppliersRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findById(id: string): Promise<Supplier | null> {
    const mikroSupplier = await this.entityManager.findOne(MikroSupplier, {
      id,
    });

    return mikroSupplier ? SupplierMapper.toDomain(mikroSupplier) : null;
  }

  public async nextSequence(): Promise<number> {
    const rows = (await this.entityManager
      .getConnection()
      .execute(`select nextval('supplier_code_seq') as nextval`)) as {
      nextval: string;
    }[];

    return Number(rows[0].nextval);
  }

  public create(supplier: Supplier): Promise<Supplier> {
    return this.persistSupplier(new MikroSupplier(), supplier, true);
  }

  public update(supplier: Supplier): Promise<Supplier> {
    const mikroSupplier = this.entityManager.getReference(
      MikroSupplier,
      supplier.getId(),
    );

    return this.persistSupplier(mikroSupplier, supplier, false);
  }

  private async persistSupplier(
    mikroSupplier: MikroSupplier,
    supplier: Supplier,
    insert: boolean,
  ): Promise<Supplier> {
    try {
      SupplierMapper.assign(mikroSupplier, supplier);

      if (insert) {
        this.entityManager.persist(mikroSupplier);
      }

      await this.entityManager.flush();

      return SupplierMapper.toDomain(mikroSupplier);
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException('Supplier code or tax code already exists');
      }

      throw e;
    }
  }
}
