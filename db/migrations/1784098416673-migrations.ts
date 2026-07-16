import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1784098416673 implements MigrationInterface {
  name = 'Migrations1784098416673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "propositions" RENAME COLUMN "price_yes" TO "odds_yes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" RENAME COLUMN "price_no" TO "odds_no"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" ALTER COLUMN "odds_yes" TYPE numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" ALTER COLUMN "odds_no" TYPE numeric(5,2)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."odds_yes" IS 'Decimal odds, e.g., 2.44 (implied probability 41%)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."odds_no" IS 'Decimal odds, e.g., 1.69 (implied probability 59%)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" ALTER COLUMN "settles_at" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "propositions" ALTER COLUMN "settles_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."odds_no" IS 'e.g., 0.59'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."odds_yes" IS 'e.g., 0.41'`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" ALTER COLUMN "odds_no" TYPE numeric(4,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" ALTER COLUMN "odds_yes" TYPE numeric(4,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" RENAME COLUMN "odds_no" TO "price_no"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" RENAME COLUMN "odds_yes" TO "price_yes"`,
    );
  }
}
