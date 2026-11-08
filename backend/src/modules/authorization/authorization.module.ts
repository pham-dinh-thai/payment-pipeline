import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MikroRole } from './infrastructure/entities/mikro-role.entity';

@Module({
  imports: [MikroOrmModule.forFeature([MikroRole])],
})
export class AuthorizationModule {}
