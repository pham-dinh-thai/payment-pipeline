import { Query } from '@nestjs/cqrs';
import { RoleListItemReadModel } from './role-list-item.read-model';

export class ListRolesQuery extends Query<RoleListItemReadModel[]> {}
