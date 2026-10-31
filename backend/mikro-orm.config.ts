import { defineConfig } from '@mikro-orm/postgresql';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { MikroProduct } from './src/modules/products/infrastructure/entities/mikro-product.entity';
import { MikroBatch } from './src/modules/inventories/infrastructure/entities/mikro-batch.entity';
import { MikroInventory } from './src/modules/inventories/infrastructure/entities/mikro-inventory.entity';

dotenv.config({ path: path.resolve('../.env') });

export default defineConfig({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  dbName: process.env.POSTGRES_DB,

  entities: [MikroProduct, MikroBatch, MikroInventory],
  entitiesTs: [MikroProduct, MikroBatch, MikroInventory],

  debug: process.env.NODE_ENV !== 'production',

  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './dist/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    emit: 'ts',
  },
});
