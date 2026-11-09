import { Global, Module } from '@nestjs/common';
import { MikroUnitOfWork } from './mikro-unit-of-work';
import { UNIT_OF_WORK } from './unit-of-work';

@Global()
@Module({
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: MikroUnitOfWork,
    },
  ],
  exports: [UNIT_OF_WORK],
})
export class UnitOfWorkModule {}
