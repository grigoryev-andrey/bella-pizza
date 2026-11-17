import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();
const databaseUrl = configService.get<string>('DATABASE_URL');
const requiresSSL =
  typeof databaseUrl === 'string' && databaseUrl.includes('sslmode=require');

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // migrationsRun: true,
  // logging: true,
  synchronize: false,
  ssl: requiresSSL,
});
