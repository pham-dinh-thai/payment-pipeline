import { User } from './user.aggregate';

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  existsByEmail(email: string): Promise<boolean>;

  create(user: User): Promise<User>;

  update(user: User): Promise<void>;
}

export const USERS_REPOSITORY = 'IUsersRepository';
