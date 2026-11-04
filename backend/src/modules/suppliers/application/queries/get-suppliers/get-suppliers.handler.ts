import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  type ISuppliersRepository,
  SUPPLIERS_REPOSITORY,
} from '../../../domain/suppliers.repository';
import { GetSuppliersQuery } from './get-suppliers.query';
import { SupplierListItemReadModel } from './supplier-list-item.read-model';

@QueryHandler(GetSuppliersQuery)
export class GetSuppliersHandler implements IQueryHandler<
  GetSuppliersQuery,
  SupplierListItemReadModel[]
> {
  public constructor(
    @Inject(SUPPLIERS_REPOSITORY)
    private readonly suppliersRepository: ISuppliersRepository,
  ) {}

  public async execute(): Promise<SupplierListItemReadModel[]> {
    const suppliers = await this.suppliersRepository.findAll();

    return suppliers.map(
      (supplier) =>
        new SupplierListItemReadModel(
          supplier.getId(),
          supplier.getCode(),
          supplier.getName(),
          supplier.getStatus(),
          supplier.getPhone(),
          supplier.getEmail(),
          supplier.getAddress(),
          supplier.getTaxCode(),
          supplier.getCreatedAt(),
          supplier.getUpdatedAt(),
        ),
    );
  }
}
