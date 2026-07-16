import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1784117137948 implements MigrationInterface {
  name = 'Migrations1784117137948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matches" ADD "external_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" ADD CONSTRAINT "UQ_matches_external_id" UNIQUE ("external_id")`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "matches"."external_id" IS 'TxLine FixtureId, used to dedupe fixture syncs'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "matches"."external_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" DROP CONSTRAINT "UQ_matches_external_id"`,
    );
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "external_id"`);
  }
}
