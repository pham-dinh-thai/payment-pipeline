import { Query } from '@nestjs/cqrs';
import { GetUserByEmailReadModel } from './get-user-by-email.read-model';

export class GetUserByEmailQuery extends Query<GetUserByEmailReadModel | null> {
  public constructor(public readonly email: string) {
    super();
  }
}
