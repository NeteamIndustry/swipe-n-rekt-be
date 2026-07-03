import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1783060106284 implements MigrationInterface {
  name = 'Migrations1783060106284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(100), "wallet_address" character varying(200), "nonce" character varying(255), "balance_usdc" numeric(18,4), "win_rate_percentage" numeric(5,2), "best_streak" integer, "current_streak" integer, "net_pnl" numeric(18,4), "total_predictions" integer, "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."id" IS 'Unique identifier for the user'; COMMENT ON COLUMN "users"."wallet_address" IS 'e.g., 7xKp...9fA2'; COMMENT ON COLUMN "users"."nonce" IS 'string acak'; COMMENT ON COLUMN "users"."win_rate_percentage" IS 'e.g., 61.0'; COMMENT ON COLUMN "users"."net_pnl" IS 'e.g., 640.00'`,
    );
    await queryRunner.query(
      `CREATE TABLE "matches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_home" character varying(100), "team_away" character varying(100), "score_home" integer, "score_away" integer, "match_minute" character varying(50), "half" character varying(50), "status" character varying(50), "created_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id")); COMMENT ON COLUMN "matches"."team_home" IS 'e.g., ARG'; COMMENT ON COLUMN "matches"."team_away" IS 'e.g., FRA'; COMMENT ON COLUMN "matches"."match_minute" IS 'e.g., 67'''; COMMENT ON COLUMN "matches"."half" IS 'e.g., 1ST HALF, 2ND HALF'; COMMENT ON COLUMN "matches"."status" IS 'scheduled, live, finished'`,
    );
    await queryRunner.query(
      `CREATE TABLE "propositions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text, "category" character varying(50), "context_text" character varying(250), "price_yes" numeric(4,2), "price_no" numeric(4,2), "status" character varying(50), "outcome" boolean, "settles_at" TIMESTAMP DEFAULT now(), "matchIdId" uuid, CONSTRAINT "PK_dbed70a76fdd7364fffffc366ae" PRIMARY KEY ("id")); COMMENT ON COLUMN "propositions"."id" IS 'The specific question being bet on'; COMMENT ON COLUMN "propositions"."question" IS 'e.g., GOAL IN THE NEXT 5 MINUTES?'; COMMENT ON COLUMN "propositions"."category" IS 'e.g., GOALS, SET PIECE'; COMMENT ON COLUMN "propositions"."context_text" IS 'e.g., Argentina pushing...'; COMMENT ON COLUMN "propositions"."price_yes" IS 'e.g., 0.41'; COMMENT ON COLUMN "propositions"."price_no" IS 'e.g., 0.59'; COMMENT ON COLUMN "propositions"."status" IS 'open, pending_settlement, resolved'; COMMENT ON COLUMN "propositions"."settles_at" IS 'Timestamp when the proposition settles'`,
    );
    await queryRunner.query(
      `CREATE TABLE "bets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "proposition_id" uuid NOT NULL, "pick" boolean NOT NULL, "stake" numeric NOT NULL, "potential_win" numeric NOT NULL, "status" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7ca91a6a39623bd5c21722bcedd" PRIMARY KEY ("id")); COMMENT ON COLUMN "bets"."pick" IS 'true for YES, false for NO'; COMMENT ON COLUMN "bets"."stake" IS 'Amount of USDC bet'; COMMENT ON COLUMN "bets"."potential_win" IS 'Potential payout'; COMMENT ON COLUMN "bets"."status" IS 'active, pending, won, lost'`,
    );
    await queryRunner.query(`COMMENT ON TABLE "bets" IS 'User positions'`);
    await queryRunner.query(
      `CREATE TABLE "bet_settlements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bet_id" uuid NOT NULL, "oracle_source" character varying(50) NOT NULL, "merkle_root" character varying(200), "leaf_hash" character varying(200), "settlement_tx" character varying(200), "slot" bigint, "settled_at" TIMESTAMP, CONSTRAINT "REL_a7622ae1683e91fbe2d0a77d89" UNIQUE ("bet_id"), CONSTRAINT "PK_c5e6401965d580178a1c5c4f6df" PRIMARY KEY ("id")); COMMENT ON COLUMN "bet_settlements"."oracle_source" IS 'e.g., TxODDS scores stream'; COMMENT ON COLUMN "bet_settlements"."settlement_tx" IS 'Solana tx hash'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "bet_settlements" IS 'On-chain verification receipt'`,
    );
    await queryRunner.query(
      `CREATE TABLE "albums" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country_name" character varying(100), "total_cards_required" integer, "reward_type" character varying(100), CONSTRAINT "PK_838ebae24d2e12082670ffc95d7" PRIMARY KEY ("id")); COMMENT ON COLUMN "albums"."id" IS 'Collection sets, e.g., Brazil, Argentina'; COMMENT ON COLUMN "albums"."total_cards_required" IS 'e.g., 26'; COMMENT ON COLUMN "albums"."reward_type" IS 'e.g., LEGENDARY CHAMPION'`,
    );
    await queryRunner.query(
      `CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "album_id" uuid, "name" character varying(100) NOT NULL, "card_type" character varying(50) NOT NULL, "position" character varying(10), "jersey_number" integer, "rarity" character varying(50) NOT NULL, "mint_address" character varying(200), "description" text, CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id")); COMMENT ON COLUMN "cards"."name" IS 'e.g., LIONEL MESSI, D. SCHMIDT'; COMMENT ON COLUMN "cards"."card_type" IS 'player, moment'; COMMENT ON COLUMN "cards"."position" IS 'FW, MF, DF'; COMMENT ON COLUMN "cards"."rarity" IS 'uncommon, rare, epic, legendary'; COMMENT ON COLUMN "cards"."mint_address" IS 'Solana cNFT address'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "cards" IS 'Players or Rare Moments (cNFTs)'`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "card_id" uuid NOT NULL, "acquired_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8803d810c730191425d124af1ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE "user_cards" IS 'Cards owned by the user'`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" ADD CONSTRAINT "FK_2e392a4a470fce8bca118e9ccdf" FOREIGN KEY ("matchIdId") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bets" ADD CONSTRAINT "FK_8e3c745e288eea6d3c9475550e2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bets" ADD CONSTRAINT "FK_6247646e757b1ba68d57aa3798c" FOREIGN KEY ("proposition_id") REFERENCES "propositions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet_settlements" ADD CONSTRAINT "FK_a7622ae1683e91fbe2d0a77d899" FOREIGN KEY ("bet_id") REFERENCES "bets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" ADD CONSTRAINT "FK_33d5870ac56fb72dbeb41c2e53a" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_cards" ADD CONSTRAINT "FK_fd1dbad94a6a2ccfc149c819076" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_cards" ADD CONSTRAINT "FK_a228f872c29059934696c9d4b61" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_cards" DROP CONSTRAINT "FK_a228f872c29059934696c9d4b61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_cards" DROP CONSTRAINT "FK_fd1dbad94a6a2ccfc149c819076"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cards" DROP CONSTRAINT "FK_33d5870ac56fb72dbeb41c2e53a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet_settlements" DROP CONSTRAINT "FK_a7622ae1683e91fbe2d0a77d899"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bets" DROP CONSTRAINT "FK_6247646e757b1ba68d57aa3798c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bets" DROP CONSTRAINT "FK_8e3c745e288eea6d3c9475550e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "propositions" DROP CONSTRAINT "FK_2e392a4a470fce8bca118e9ccdf"`,
    );
    await queryRunner.query(`COMMENT ON TABLE "user_cards" IS NULL`);
    await queryRunner.query(`DROP TABLE "user_cards"`);
    await queryRunner.query(`COMMENT ON TABLE "cards" IS NULL`);
    await queryRunner.query(`DROP TABLE "cards"`);
    await queryRunner.query(`DROP TABLE "albums"`);
    await queryRunner.query(`COMMENT ON TABLE "bet_settlements" IS NULL`);
    await queryRunner.query(`DROP TABLE "bet_settlements"`);
    await queryRunner.query(`COMMENT ON TABLE "bets" IS NULL`);
    await queryRunner.query(`DROP TABLE "bets"`);
    await queryRunner.query(`DROP TABLE "propositions"`);
    await queryRunner.query(`DROP TABLE "matches"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
