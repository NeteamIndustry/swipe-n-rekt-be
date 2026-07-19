import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnchainMarketAndBetFields1784369830043 implements MigrationInterface {
    name = 'AddOnchainMarketAndBetFields1784369830043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propositions" ADD "market_address" character varying(100)`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."market_address" IS 'On-chain Market PDA for this proposition, once initialized'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "vault_address" character varying(100)`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."vault_address" IS 'On-chain escrow vault PDA for this proposition'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "market_init_tx" character varying(200)`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."market_init_tx" IS 'Solana tx signature that created the on-chain market'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "on_chain_fixture_id" bigint`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_fixture_id" IS 'fixture_id used to derive the Market PDA'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "on_chain_stat_key" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_stat_key" IS 'stat_key used to derive the Market PDA. Placeholder until real TxLine stat modeling exists — see settle_market (real oracle) follow-up.'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "on_chain_threshold" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_threshold" IS 'TraderPredicate threshold. Placeholder, unused by settle_market_mock.'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "on_chain_comparison" smallint`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_comparison" IS 'TraderPredicate comparison (0=GreaterThan,1=LessThan,2=EqualTo). Placeholder, unused by settle_market_mock.'`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "on_chain_window_start" bigint`);
        await queryRunner.query(`ALTER TABLE "propositions" ADD "on_chain_window_end" bigint`);
        await queryRunner.query(`ALTER TABLE "bets" ADD "tx_signature" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "UQ_cfc1aeae34fd733e31cbbf2b6bd" UNIQUE ("tx_signature")`);
        await queryRunner.query(`ALTER TABLE "bets" ADD "position_address" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "position_address"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "UQ_cfc1aeae34fd733e31cbbf2b6bd"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "tx_signature"`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "on_chain_window_end"`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "on_chain_window_start"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_comparison" IS 'TraderPredicate comparison (0=GreaterThan,1=LessThan,2=EqualTo). Placeholder, unused by settle_market_mock.'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "on_chain_comparison"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_threshold" IS 'TraderPredicate threshold. Placeholder, unused by settle_market_mock.'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "on_chain_threshold"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_stat_key" IS 'stat_key used to derive the Market PDA. Placeholder until real TxLine stat modeling exists — see settle_market (real oracle) follow-up.'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "on_chain_stat_key"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."on_chain_fixture_id" IS 'fixture_id used to derive the Market PDA'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "on_chain_fixture_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."market_init_tx" IS 'Solana tx signature that created the on-chain market'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "market_init_tx"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."vault_address" IS 'On-chain escrow vault PDA for this proposition'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "vault_address"`);
        await queryRunner.query(`COMMENT ON COLUMN "propositions"."market_address" IS 'On-chain Market PDA for this proposition, once initialized'`);
        await queryRunner.query(`ALTER TABLE "propositions" DROP COLUMN "market_address"`);
    }

}
