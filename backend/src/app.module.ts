import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mikroOrmConfig from '../mikro-orm.config';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { InventoriesModule } from './modules/inventories/inventories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    OrdersModule,
    ProductsModule,
    MikroOrmModule.forRoot(mikroOrmConfig),
    CqrsModule.forRoot(),
    InventoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
