import { Query } from '@nestjs/cqrs';
import { ProductListItemReadModel } from './product-list-item.read-model';

export class GetProductsQuery extends Query<ProductListItemReadModel[]> {}
