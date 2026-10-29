import { Injectable } from '@nestjs/common';
import { IProductsRepository } from '../../domain/products.repository';
import { Product } from '../../domain/product.aggregate';
import { EntityManager } from '@mikro-orm/postgresql';
import { MikroProduct } from '../entities/mikro-product.entity';

@Injectable()
export class MikroProductsRepository implements IProductsRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async create(product: Product): Promise<void> {
    const mikroProduct = this.entityManager.create(MikroProduct, {
      id: product.getId(),
      name: product.getName(),
      unitPrice: product.getUnitPrice(),
      quantity: product.getQuantity(),
      createdAt: product.getCreatedAt(),
      updatedAt: product.getUpdatedAt(),
    });

    this.entityManager.persist(mikroProduct);

    await this.entityManager.flush();
  }
}
