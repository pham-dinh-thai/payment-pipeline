import { Query } from '@nestjs/cqrs';
import { GetUserByIdReadModel } from './get-user-by-id.read-model';

export class GetUserByIdQuery extends Query<GetUserByIdReadModel | null> {
  public constructor(public readonly id: string) {
    super();
  }
}
