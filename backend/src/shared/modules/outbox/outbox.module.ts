import { Module } from '@nestjs/common';

/**
 * Infrastructure module for the transactional outbox.
 *
 * The outbox entity, repository, writer and relay worker will live here.
 * Business modules should depend on this module, not on audit-log internals.
 */
@Module({})
export class OutboxModule {}
