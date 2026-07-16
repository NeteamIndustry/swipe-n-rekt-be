import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1784200000000 implements MigrationInterface {
  name = 'Migrations1784200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bets" ADD "market_id" character varying(150)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "bets"."market_id" IS 'On-chain market identifier this bet was placed against'`,
    );
    await queryRunner.query(
      `ALTER TABLE "bets" ADD "position_id" character varying(150)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "bets"."position_id" IS 'Position id returned by SolanaService.placeBet'`,
    );
    await queryRunner.query(
      `ALTER TABLE "bets" ADD "place_bet_tx_sig" character varying(200)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "bets"."place_bet_tx_sig" IS 'Solana tx signature for the place_bet call'`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_cards" ADD "mint_address" character varying(200)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user_cards"."mint_address" IS 'cNFT mint address for this specific copy, from SolanaService.mintCard'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_cards" ADD "mint_tx_sig" character varying(200)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user_cards"."mint_tx_sig" IS 'Solana tx signature for the mint_card call'`,
    );

    await queryRunner.query(
      `CREATE TABLE "set_reward_claims" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "album_id" uuid NOT NULL,
        "period" character varying(100) NOT NULL,
        "amount" numeric(18,4) NOT NULL,
        "tx_sig" character varying(200),
        "claimed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_set_reward_claims_user_album_period" UNIQUE ("user_id", "album_id", "period"),
        CONSTRAINT "PK_set_reward_claims" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "set_reward_claims" IS 'Album set-completion reward claims (SolanaService.claimSetReward)'`,
    );
    await queryRunner.query(
      `ALTER TABLE "set_reward_claims" ADD CONSTRAINT "FK_set_reward_claims_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "set_reward_claims" ADD CONSTRAINT "FK_set_reward_claims_album_id" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "set_reward_claims" DROP CONSTRAINT "FK_set_reward_claims_album_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "set_reward_claims" DROP CONSTRAINT "FK_set_reward_claims_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "set_reward_claims"`);

    await queryRunner.query(
      `COMMENT ON COLUMN "user_cards"."mint_tx_sig" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_cards" DROP COLUMN "mint_tx_sig"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "user_cards"."mint_address" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_cards" DROP COLUMN "mint_address"`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN "bets"."place_bet_tx_sig" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "place_bet_tx_sig"`);
    await queryRunner.query(`COMMENT ON COLUMN "bets"."position_id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "position_id"`);
    await queryRunner.query(`COMMENT ON COLUMN "bets"."market_id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "market_id"`);
  }
}
