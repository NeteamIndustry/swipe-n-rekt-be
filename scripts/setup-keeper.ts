/**
 * Sets up the backend authority / keeper wallet for the on-chain loop
 * (initializeMarket + settleMarketMock — see src/solana/solana.service.ts).
 *
 * Unlike scripts/generate-devnet-wallet.ts (which writes a CLI-style JSON byte
 * array for `solana` CLI tooling), this prints the secret key in the *base58*
 * form that SOLANA_KEEPER_SECRET_KEY is consumed as — the config decodes it
 * with anchor's `utils.bytes.bs58.decode`, so the two must match exactly.
 *
 * What it does:
 *   1. Reuses an existing keeper if SOLANA_KEEPER_SECRET_KEY is already set
 *      (or a base58 key is passed as argv[2]); otherwise generates a fresh one.
 *   2. Requests a devnet airdrop so the keeper can pay for initializeMarket /
 *      settleMarketMock. Devnet airdrops are rate-limited and flaky — a
 *      failure here is non-fatal; fund manually if it does not go through.
 *   3. Prints the pubkey, current balance, and the exact .env line to paste.
 *
 * Run with:
 *   npx ts-node --transpile-only scripts/setup-keeper.ts [base58SecretKey]
 *
 * Reads SOLANA_RPC_URL / SOLANA_KEEPER_SECRET_KEY from the environment (.env),
 * falling back to devnet — same defaults as configService.getSolanaConfig().
 */
import { utils } from '@coral-xyz/anchor';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { config } from 'dotenv';

config();

const AIRDROP_SOL = 2;

function loadOrGenerateKeeper(): { keypair: Keypair; reused: boolean } {
  const provided = process.argv[2] ?? process.env.SOLANA_KEEPER_SECRET_KEY;
  if (provided) {
    return {
      keypair: Keypair.fromSecretKey(utils.bytes.bs58.decode(provided.trim())),
      reused: true,
    };
  }
  return { keypair: Keypair.generate(), reused: false };
}

async function main(): Promise<void> {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  const { keypair, reused } = loadOrGenerateKeeper();
  const pubkey = keypair.publicKey.toBase58();
  const secretKeyBase58 = utils.bytes.bs58.encode(keypair.secretKey);

  console.log(reused ? 'Reusing keeper wallet:' : 'Generated keeper wallet:');
  console.log('  Public key:', pubkey);
  console.log('  RPC:', rpcUrl);

  try {
    console.log(`\nRequesting ${AIRDROP_SOL} SOL airdrop...`);
    const signature = await connection.requestAirdrop(
      keypair.publicKey,
      AIRDROP_SOL * LAMPORTS_PER_SOL,
    );
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      'confirmed',
    );
    console.log('  Airdrop confirmed:', signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `  Airdrop failed (${message}). Devnet faucets are rate-limited; ` +
        `fund manually:\n    solana airdrop ${AIRDROP_SOL} ${pubkey} --url devnet`,
    );
  }

  try {
    const balance = await connection.getBalance(keypair.publicKey);
    console.log('  Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
  } catch {
    // balance is informational only
  }

  console.log('\nAdd this to your .env:');
  console.log(`SOLANA_KEEPER_SECRET_KEY=${secretKeyBase58}`);
  console.log(
    '\nThis keeper is the authority for initialize_market, so it must be the ' +
      'same wallet used to init every market it later settles.',
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
