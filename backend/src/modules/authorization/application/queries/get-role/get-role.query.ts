import { Query } from '@nestjs/cqrs';
import { RoleReadModel } from './role.read-model';

export class GetRoleQuery extends Query<RoleReadModel> {
  public constructor(public readonly id: string) {
    super();
  }
}
