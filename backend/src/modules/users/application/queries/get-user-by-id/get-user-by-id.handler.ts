import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { GetUserByIdReadModel } from './get-user-by-id.read-model';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  public async execute(
    query: GetUserByIdQuery,
  ): Promise<GetUserByIdReadModel | null> {
    const user = await this.usersRepository.findById(query.id);

    if (!user) {
      return null;
    }

    return new GetUserByIdReadModel(
      user.getId(),
      user.getFirstName(),
      user.getLastName(),
      user.getEmail(),
      user.getRoleIds(),
      user.getCreatedAt(),
      user.getUpdatedAt(),
    );
  }
}
