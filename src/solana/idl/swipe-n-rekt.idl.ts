import type { Idl } from '@coral-xyz/anchor';
import { anchorDiscriminator } from '../discriminator.util';

type IdlField = Idl['instructions'][number]['args'][number];
type IdlInstructionAccountItem =
  Idl['instructions'][number]['accounts'][number];

/**
 * Hand-authored Anchor IDL for the swipe_n_rekt program
 * (https://github.com/IanLaFlair/swipenrekt-blockchain), covering only the
 * instructions/events the backend actually calls this pass:
 * initialize_reward_pool, initialize_market, place_bet, settle_market_mock.
 *
 * There's no `anchor build` output to copy from (Rust/Anchor toolchain isn't
 * installed here, and target/idl is gitignored in that repo), so this is
 * built directly from the Rust source (lib.rs / instructions/*.rs /
 * events.rs). Discriminators are computed via anchorDiscriminator() rather
 * than hand-typed. Every account is always passed explicitly by
 * SolanaService (never relies on Anchor's PDA auto-resolution), so `accounts`
 * entries only need name/writable/signer — no `pda`/`address` metadata.
 *
 * `place_bet` and `claim_payout` are user-wallet-signed and are not invoked
 * by the backend, so they (and `settle_market`, `mint_card`,
 * `claim_set_reward`) are intentionally left out rather than risk an
 * unverified encoding for instructions we never send.
 */

function account(
  name: string,
  opts: { writable?: boolean; signer?: boolean } = {},
): IdlInstructionAccountItem {
  return {
    name,
    writable: opts.writable ?? false,
    signer: opts.signer ?? false,
  };
}

function field(name: string, type: IdlField['type']): IdlField {
  return { name, type };
}

const marketInitializedType = {
  name: 'MarketInitialized',
  type: {
    kind: 'struct' as const,
    fields: [
      field('market', 'pubkey'),
      field('fixture_id', 'i64'),
      field('stat_key', 'u32'),
      field('period', 'i32'),
      field('threshold', 'i32'),
      field('comparison', 'u8'),
      field('window_start', 'i64'),
      field('window_end', 'i64'),
    ],
  },
};

const betPlacedType = {
  name: 'BetPlaced',
  type: {
    kind: 'struct' as const,
    fields: [
      field('market', 'pubkey'),
      field('user', 'pubkey'),
      field('side', 'u8'),
      field('amount', 'u64'),
      field('fee', 'u64'),
      field('total_yes', 'u64'),
      field('total_no', 'u64'),
    ],
  },
};

const marketSettledType = {
  name: 'MarketSettled',
  type: {
    kind: 'struct' as const,
    fields: [field('market', 'pubkey'), field('winning_side', 'u8')],
  },
};

export function buildSwipeNRektIdl(programId: string): Idl {
  return {
    address: programId,
    metadata: {
      name: 'swipe_n_rekt',
      version: '0.1.0',
      spec: '0.1.0',
    },
    instructions: [
      {
        name: 'initialize_reward_pool',
        discriminator: anchorDiscriminator('global', 'initialize_reward_pool'),
        accounts: [
          account('reward_pool', { writable: true }),
          account('authority', { writable: true, signer: true }),
          account('system_program'),
        ],
        args: [],
      },
      {
        name: 'initialize_market',
        discriminator: anchorDiscriminator('global', 'initialize_market'),
        accounts: [
          account('market', { writable: true }),
          account('authority', { writable: true, signer: true }),
          account('system_program'),
        ],
        args: [
          field('fixture_id', 'i64'),
          field('stat_key', 'u32'),
          field('period', 'i32'),
          field('threshold', 'i32'),
          field('comparison', 'u8'),
          field('window_start', 'i64'),
          field('window_end', 'i64'),
        ],
      },
      {
        name: 'settle_market_mock',
        discriminator: anchorDiscriminator('global', 'settle_market_mock'),
        accounts: [
          account('market', { writable: true }),
          account('authority', { signer: true }),
        ],
        args: [field('winning_side', 'u8')],
      },
    ],
    events: [
      {
        name: 'MarketInitialized',
        discriminator: anchorDiscriminator('event', 'MarketInitialized'),
      },
      {
        name: 'BetPlaced',
        discriminator: anchorDiscriminator('event', 'BetPlaced'),
      },
      {
        name: 'MarketSettled',
        discriminator: anchorDiscriminator('event', 'MarketSettled'),
      },
    ],
    types: [marketInitializedType, betPlacedType, marketSettledType],
  };
}
