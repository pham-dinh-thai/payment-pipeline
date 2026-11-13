import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetActorPermissionsQuery } from './get-actor-permissions.query';
import { GetActorPermissionsReadModel } from './get-actor-permissions.read-model';
import { GetUserRoleIdsQuery } from '../../../../users/application/queries/get-user-role-ids/get-user-role-ids.query';
import { Inject } from '@nestjs/common';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';

@QueryHandler(GetActorPermissionsQuery)
export class GetActorPermissionsHandler implements IQueryHandler<GetActorPermissionsQuery> {
  public constructor(
    private readonly queryBus: QueryBus,

    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,
  ) {}

  public async execute(
    query: GetActorPermissionsQuery,
  ): Promise<GetActorPermissionsReadModel> {
    const { roleIds } = await this.queryBus.execute(
      new GetUserRoleIdsQuery(query.actorId),
    );

    const results = await this.rolesRepository.findAccessByRoleIds(roleIds);

    return new GetActorPermissionsReadModel(
      query.actorId,
      results.permissions,
      results.isSuperAdmin,
    );
  }
}
