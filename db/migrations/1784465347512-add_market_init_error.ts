import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketInitError1784465347512 implements MigrationInterface {
  name = 'AddMarketInitError1784465347512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "propositions" ADD "market_init_error" text`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."market_init_error" IS 'Last error message from a failed initializeMarket attempt, if the on-chain market has not been created yet. Cleared on success.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."market_init_error" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" DROP COLUMN "market_init_error"`,
    );
  }
}
