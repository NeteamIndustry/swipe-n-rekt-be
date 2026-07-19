import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOutcomeKey1784500000000 implements MigrationInterface {
  name = 'AddOutcomeKey1784500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "propositions" ADD "outcome_key" character varying(100)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."outcome_key" IS 'Stable identifier of the market outcome this proposition covers (e.g. "1X2_PARTICIPANT_RESULT:part1"). Used to dedupe scheduled generation so a match+outcome is not recreated while still open.'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "propositions"."outcome_key" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" DROP COLUMN "outcome_key"`,
    );
  }
}
