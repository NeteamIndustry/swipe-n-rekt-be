import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { configService } from './app.config';

export default registerAs('typeorm', () => configService.getMigrationConfig());
export const connectionSource = new DataSource(
  configService.getMigrationConfig() as DataSourceOptions,
);
