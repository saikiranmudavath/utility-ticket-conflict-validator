import { Module } from '@nestjs/common';
import {Pool} from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: async () => {
        const pool =  new Pool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        });
        await pool.connect();

        console.log('postgres database connected successfully');
        return pool;
      },
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}