import { Query } from '@nestjs/cqrs';

export class GetUserRoleIdsQuery extends Query<{
  id: string;
  roleIds: string[];
}> {
  public constructor(public readonly id: string) {
    super();
  }
}
