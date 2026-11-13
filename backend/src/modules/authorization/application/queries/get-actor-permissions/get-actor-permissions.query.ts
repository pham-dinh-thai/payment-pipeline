import { Query } from '@nestjs/cqrs';
import { GetActorPermissionsReadModel } from './get-actor-permissions.read-model';

export class GetActorPermissionsQuery extends Query<GetActorPermissionsReadModel> {
  public constructor(public readonly actorId: string) {
    super();
  }
}
