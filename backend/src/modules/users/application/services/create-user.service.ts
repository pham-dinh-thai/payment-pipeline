import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user.aggregate';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '../../domain/users.repository';

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
};

/**
 * Shared user-creation rules. Kept outside the command handlers so the
 * primitive (internal) and top-level (audited) use cases stay in sync.
 */
@Injectable()
export class CreateUserService {
  public constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  public async create(input: CreateUserInput): Promise<User> {
    if (await this.usersRepository.existsByEmail(input.email)) {
      throw new ConflictException(`User email ${input.email} already exists`);
    }

    const user = User.create(input);

    await this.usersRepository.create(user);

    return user;
  }
}
