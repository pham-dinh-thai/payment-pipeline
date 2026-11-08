import { Injectable } from '@nestjs/common';
import { IGetUserByIdPort } from '../../application/commands/refresh-token/ports/get-user-by-id-port';
import { GetUserByIdQuery } from '../../../users/application/queries/get-user-by-id/get-user-by-id.query';
import { QueryBus } from '@nestjs/cqrs';

@Injectable()
export class GetUserByIdAdapter implements IGetUserByIdPort {
  public constructor(private readonly queryBus: QueryBus) {}

  public async execute(
    id: string,
  ): Promise<{ id: string; email: string } | null> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(id));

    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email };
  }
}
