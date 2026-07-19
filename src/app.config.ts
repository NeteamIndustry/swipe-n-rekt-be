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

  // Auth for the proven-working /api/fixtures/snapshot contract (see
  // scripts/txline-competition-test.ts) — kept separate from
  // getTxlineConfig() above because that one is for the still-unimplemented
  // on-chain-activated flow and uses a different token.
  public getTxlineFixturesConfig() {
    return {
      apiToken: this.getValue('TXLINE_TOKEN', false),
      jwt: this.getValue('TXLINE_JWT', false),
      competitionId: this.getValue('TXLINE_COMPETITION_ID', false),
    };
  }

  public getAiConfig() {
    return {
      apiUrl: this.getValue('AI_API_URL', false),
      apiKey: this.getValue('AI_API_KEY', false),
      model: this.getValue('AI_MODEL', false),
    };
  }

  public getSolanaConfig() {
    return {
      // Devnet by default — the deployed swipe_n_rekt program currently only
      // lives on devnet. See swipenrekt-blockchain/README.md.
      rpcUrl:
        this.getValue('SOLANA_RPC_URL', false) ??
        'https://api.devnet.solana.com',
      programId:
        this.getValue('SOLANA_PROGRAM_ID', false) ??
        'iZvZwSKPvRZpEqxyXSiRGos9pGuuzygmKdcAB6biffQ',
      // Base58 secret key of the backend authority/keeper — required only for
      // calls that sign as the authority (initializeMarket, settleMarketMock).
      // Not validated at boot so the app can still run read-only without it.
      keeperSecretKey: this.getValue('SOLANA_KEEPER_SECRET_KEY', false),
    };
  }

  public getPricingConfig() {
    const raw = this.getValue('HOUSE_MARGIN_PCT', false);
    const parsed = raw !== undefined ? parseFloat(raw) : NaN;
    return {
      // Fraction added on top of fair probability before it's converted to
      // decimal odds, e.g. 0.06 = 6% overround split across oddsYes + oddsNo.
      // See proposition.pricing.ts.
      houseMarginPct: Number.isFinite(parsed) ? parsed : 0.06,
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
  'AI_API_URL',
  'AI_API_KEY',
  'AI_MODEL',
]);

export { configService };
