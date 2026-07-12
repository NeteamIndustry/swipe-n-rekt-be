import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1783834351013 implements MigrationInterface {
    name = 'Migrations1783834351013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propositions" DROP CONSTRAINT "FK_2e392a4a470fce8bca118e9ccdf"`);
        await queryRunner.query(`ALTER TABLE "propositions" RENAME COLUMN "matchIdId" TO "match_id"`);
        await queryRunner.query(`CREATE TABLE "user_packs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "pack_rarity" character varying(50) NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_2db65f40f0df2f96c7a957382c4" PRIMARY KEY ("id")); COMMENT ON COLUMN "user_packs"."pack_rarity" IS 'common, uncommon, rare, epic'`);
        await queryRunner.query(`COMMENT ON TABLE "user_packs" IS 'Unopened card packs in inventory'`);
        await queryRunner.query(`ALTER TABLE "propositions" ALTER COLUMN "match_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_packs" ADD CONSTRAINT "FK_caed8135cb7632864b3ae1714fe" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD CONSTRAINT "FK_9c3a376c4e5621237e13d8223ce" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propositions" DROP CONSTRAINT "FK_9c3a376c4e5621237e13d8223ce"`);
        await queryRunner.query(`ALTER TABLE "user_packs" DROP CONSTRAINT "FK_caed8135cb7632864b3ae1714fe"`);
        await queryRunner.query(`ALTER TABLE "propositions" ALTER COLUMN "match_id" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON TABLE "user_packs" IS NULL`);
        await queryRunner.query(`DROP TABLE "user_packs"`);
        await queryRunner.query(`ALTER TABLE "propositions" RENAME COLUMN "match_id" TO "matchIdId"`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD CONSTRAINT "FK_2e392a4a470fce8bca118e9ccdf" FOREIGN KEY ("matchIdId") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
