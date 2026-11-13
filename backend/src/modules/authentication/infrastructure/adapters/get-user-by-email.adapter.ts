import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from '../../../users/application/queries/get-user-by-email/get-user-by-email.query';
import { IGetUserByEmailPort } from '../../application/commands/login/ports/get-user-by-email.port';

@Injectable()
export class GetUserByEmailAdapter implements IGetUserByEmailPort {
  public constructor(private readonly queryBus: QueryBus) {}

  public async execute(
    email: string,
  ): Promise<{ id: string; email: string } | null> {
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email));

    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email };
  }
}
