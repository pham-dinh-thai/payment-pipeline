import { Command } from '@nestjs/cqrs';
import { type ActorHeaders } from '../../../../../shared/types/actor-headers';
import { UpdateSupplierResponse } from './update-supplier.response';

export class UpdateSupplierCommand extends Command<UpdateSupplierResponse> {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly taxCode: string | null,
    public readonly headers: ActorHeaders,
  ) {
    super();
  }
}
