import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { Inject } from '@nestjs/common';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../../domain/users.repository';
import { GetUserByEmailReadModel } from './get-user-by-email.read-model';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  public async execute(
    query: GetUserByEmailQuery,
  ): Promise<GetUserByEmailReadModel | null> {
    const user = await this.usersRepository.findByEmail(query.email);

    if (!user) {
      return null;
    }

    return new GetUserByEmailReadModel(
      user.getId(),
      user.getFirstName(),
      user.getLastName(),
      user.getEmail(),
      user.getCreatedAt(),
      user.getUpdatedAt(),
    );
  }
}
