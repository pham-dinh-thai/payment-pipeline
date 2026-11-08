import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  type IRolesRepository,
  ROLES_REPOSITORY,
} from '../../../domain/roles.repository';
import { ListRolesQuery } from './list-roles.query';
import { RoleListItemReadModel } from './role-list-item.read-model';

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<
  ListRolesQuery,
  RoleListItemReadModel[]
> {
  public constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,
  ) {}

  public async execute(): Promise<RoleListItemReadModel[]> {
    const roles = await this.rolesRepository.findAll();

    return roles.map((role) => RoleListItemReadModel.fromRole(role));
  }
}
