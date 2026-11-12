import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MikroOutBoxEvent } from './infrastructure/mikro-outbox-event.entity';
import { OUTBOX_REPOSITORY } from './domain/outbox.repository';
import { MikroOutBoxRepository } from './infrastructure/mikro-outbox.repository';
import { OutboxConsumerRegistry } from './application/outbox-consumer.registry';
import { OutboxRelay } from './application/outbox-relay.service';

@Module({
  imports: [MikroOrmModule.forFeature([MikroOutBoxEvent])],
  providers: [
    { provide: OUTBOX_REPOSITORY, useClass: MikroOutBoxRepository },
    OutboxConsumerRegistry,
    OutboxRelay,
  ],
  exports: [OUTBOX_REPOSITORY, OutboxConsumerRegistry],
})
export class OutBoxModule {}
