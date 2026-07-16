/**
 * Standalone script — NOT part of the Nest app, not wired into any module.
 * Run manually to sanity-check the TxLine (Txoracle) on-chain integration
 * before building it into src/match/txline.service.ts.
 *
 * Flow (per https://txline-docs.txodds.com/api-reference):
 *   1. Load the on-chain IDL and subscribe to a TxLine service tier.
 *   2. Start a guest session to get a JWT.
 *   3. Sign a message binding the subscribe tx + leagues + JWT.
 *   4. Activate the API token via /api/token/activate.
 *
 * Run with:
 *   npx ts-node --transpile-only scripts/txline-test.ts
 */
import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import axios from 'axios';
import * as fs from 'fs';
import nacl from 'tweetnacl';

// Path to a Solana CLI-style keypair JSON file (array of 64 secret key
// bytes), e.g. the file `solana-keygen new` produces. Point this at your
// funded mainnet wallet, or override at runtime with:
//   WALLET_KEYPAIR_PATH=/path/to/mainnet-wallet.json npx ts-node ...
const WALLET_KEYPAIR_PATH =
  process.env.WALLET_KEYPAIR_PATH ?? `${process.cwd()}/mainnet-wallet.json`;

function loadWallet(): Keypair {
  if (fs.existsSync(WALLET_KEYPAIR_PATH)) {
    const secretKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(WALLET_KEYPAIR_PATH, 'utf8')),
    );
    return Keypair.fromSecretKey(secretKey);
  }

  console.warn(
    `No keypair found at ${WALLET_KEYPAIR_PATH} — falling back to a throwaway ` +
      'wallet. Set WALLET_KEYPAIR_PATH to a funded devnet wallet (SOL + TXL) ' +
      'for the subscribe call to succeed.',
  );
  return Keypair.generate();
}

const NETWORK: 'mainnet' | 'devnet' = 'mainnet';

const CONFIG = {
  mainnet: {
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    apiOrigin: 'https://txline.txodds.com',
    programId: new PublicKey('9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA'),
    txlTokenMint: new PublicKey('Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL'),
  },
  devnet: {
    rpcUrl: 'https://api.devnet.solana.com',
    // txline-docs.txodds.com lists the dev host as plain http — forcing
    // https here is what caused the earlier "unable to verify the first
    // certificate" failure.
    apiOrigin: 'http://txline-dev.txodds.com',
    programId: new PublicKey('6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J'),
    txlTokenMint: new PublicKey('4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG'),
  },
} as const;

const { rpcUrl, apiOrigin, programId, txlTokenMint } = CONFIG[NETWORK];
const apiBaseUrl = `${apiOrigin}/api`;

// Free tier configuration - choose one:
const SERVICE_LEVEL_ID = 1; // Devnet: samplingIntervalSec = 0; mainnet: 60 seconds
// const SERVICE_LEVEL_ID = 12; // Mainnet real-time World Cup & Int Friendlies
const DURATION_WEEKS = 4; // Subscribe for 4 weeks at a time
const SELECTED_LEAGUES: number[] = []; // Empty for standard bundle

async function signActivationMessage(
  wallet: anchor.Wallet,
  message: Uint8Array,
): Promise<Uint8Array> {
  if ('signMessage' in wallet && typeof wallet.signMessage === 'function') {
    return wallet.signMessage(message);
  }

  const localPayer = (wallet as anchor.Wallet & { payer?: Keypair }).payer;
  if (localPayer) {
    return nacl.sign.detached(message, localPayer.secretKey);
  }

  throw new Error(
    'Wallet must support signMessage, or run with a local Anchor payer.',
  );
}

async function main() {
  const connection = new Connection(rpcUrl, 'confirmed');

  const keypair = loadWallet();
  const wallet = new anchor.Wallet(keypair);
  console.log(`Using wallet: ${wallet.publicKey.toBase58()}`);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  anchor.setProvider(provider);

  console.log(
    `Fetching on-chain IDL for ${programId.toBase58()} (${NETWORK})...`,
  );
  // Program.at() fetches the IDL from an on-chain account that only exists
  // if `anchor idl init` was run for that specific deployment. That's true
  // for the devnet program but NOT for mainnet (verified via
  // anchor's idlAddress() derivation — the account isn't there even though
  // the mainnet program itself is deployed and executable). Same codebase
  // (txoracle) either way, so fall back to the devnet-fetched IDL retargeted
  // at whichever network's program ID is active.
  let program: anchor.Program;
  try {
    program = await anchor.Program.at(programId, provider);
  } catch (err) {
    console.warn(
      `On-chain IDL fetch failed (${(err as Error).message}) — falling back ` +
        "to scripts/idl/txoracle.json retargeted at this network's program ID.",
    );
    const idl = JSON.parse(
      fs.readFileSync(`${__dirname}/idl/txoracle.json`, 'utf8'),
    );
    idl.address = programId.toBase58();
    program = new anchor.Program(idl, provider);
  }

  if (!program.programId.equals(programId)) {
    throw new Error(
      `Loaded IDL program ${program.programId.toBase58()} does not match ${NETWORK} program ${programId.toBase58()}`,
    );
  }

  console.log('Program loaded OK.');
  console.log(
    'Instructions:',
    program.idl.instructions.map((ix) => ix.name),
  );
  console.log(
    'Accounts:',
    (program.idl.accounts ?? []).map((a) => a.name),
  );

  // --- Subscribe on-chain ---------------------------------------------------
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('token_treasury_v2')],
    program.programId,
  );

  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    txlTokenMint,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('pricing_matrix')],
    program.programId,
  );

  const userTokenAccount = getAssociatedTokenAddressSync(
    txlTokenMint,
    provider.wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  // subscribe() expects userTokenAccount to already exist (it doesn't create
  // it) — bundle an idempotent ATA-create instruction into the same
  // transaction so it's atomic with the subscribe call.
  const createUserTokenAccountIx =
    createAssociatedTokenAccountIdempotentInstruction(
      provider.wallet.publicKey,
      userTokenAccount,
      provider.wallet.publicKey,
      txlTokenMint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

  const txSig = await program.methods
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accounts({
      user: provider.wallet.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: txlTokenMint,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions([createUserTokenAccountIx])
    .rpc();

  console.log('Subscription transaction:', txSig);

  // --- Activate API access ---------------------------------------------------
  const { data: authResponse } = await axios.post(
    `${apiOrigin}/auth/guest/start`,
  );
  const jwt: string = authResponse.token;

  // For SELECTED_LEAGUES = [], this signs `${txSig}::${jwt}`.
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(',')}:${jwt}`;
  const message = new TextEncoder().encode(messageString);
  const signatureBytes = await signActivationMessage(wallet, message);
  const walletSignature = Buffer.from(signatureBytes).toString('base64');

  const { data: activationResponse } = await axios.post(
    `${apiBaseUrl}/token/activate`,
    {
      txSig,
      walletSignature,
      leagues: SELECTED_LEAGUES,
    },
    {
      headers: { Authorization: `Bearer ${jwt}` },
    },
  );

  const apiToken = activationResponse.token ?? activationResponse;
  console.log('API Token activated successfully!');
  console.log('API token:', apiToken);
}

main().catch((err) => {
  if (axios.isAxiosError(err)) {
    console.error(
      'TxLine API call failed:',
      err.response?.status,
      err.response?.data ?? err.message,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
