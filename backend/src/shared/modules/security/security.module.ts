import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        signOptions: { expiresIn: config.getOrThrow('JWT_ACCESS_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [AuthGuard, PermissionsGuard],
  exports: [AuthGuard, PermissionsGuard, JwtModule],
})
export class SecurityModule {}
