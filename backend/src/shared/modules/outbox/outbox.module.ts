import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroOutboxEvent } from './entities/mikro-outbox-event.entity';
import { OutboxConsumerRegistry } from './outbox-consumer.registry';
import { OutboxRelay } from './outbox-relay';
import { OutboxWriter } from './outbox-writer';
import { MikroOutboxRepository } from './repositories/mikro-outbox.repository';
import { OUTBOX_REPOSITORY } from './repositories/outbox.repository';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([MikroOutboxEvent])],
  providers: [
    OutboxWriter,
    OutboxConsumerRegistry,
    OutboxRelay,
    {
      provide: OUTBOX_REPOSITORY,
      useClass: MikroOutboxRepository,
    },
  ],
  exports: [OutboxWriter, OutboxConsumerRegistry],
})
export class OutboxModule {}
