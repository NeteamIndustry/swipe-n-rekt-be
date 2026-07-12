import { Logger } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
    private env: {
      [k: string]: string | undefined;
    },
  ) {}

  private getValue(key: string, throwOnMissing = true): string | undefined {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`Error! config error missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public getServerSecret() {
    return this.getValue('SERVER_SECRET', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT') ?? '5432'),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      entities: ['dist/**/entities/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      // migrationsTableName: 'migration',
      // migrations: ['src/migration/*.ts'],
      // ssl: this.isProduction(),
    };
  }

  public getMigrationConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT') ?? '5432'),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      entities: ['dist/**/entities/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      // migrationsTableName: 'migration',
      migrations: ['db/migrations/*{.ts,.js}'],
      ssl: false,
      schema: 'public',
      synchronize: false,
    };
  }

  public getJwtConfig(): JwtModuleOptions {
    return {
      global: true,
      secret: this.getValue('JWT_SECRET'),
      signOptions: {
        expiresIn: '24h',
      },
    };
  }

  public getRedisConfig() {
    return {
      host: this.getValue('REDIS_HOST'),
      port: parseInt(this.getValue('REDIS_PORT') ?? '6379'),
      password: this.getValue('REDIS_PASS'),
    };
  }

  public getS3Config() {
    return {
      endPoint: this.getValue('S3_ENDPOINT'),
      bucketName: this.getValue('S3_BUCKET_NAME'),
      bucketPublicName: this.getValue('S3_BUCKET_PUBLIC_NAME'),
      accessKey: this.getValue('S3_ACCESS_KEY'),
      secretKey: this.getValue('S3_SECRET_KEY'),
    };
  }

  public getTxlineConfig() {
    return {
      apiBaseUrl: this.getValue('TXLINE_API_BASE_URL', false),
      apiToken: this.getValue('TXLINE_API_TOKEN', false),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
]);

export { configService };
