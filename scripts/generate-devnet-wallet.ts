/**
 * Generates a new Solana keypair and writes it as a CLI-style keypair JSON
 * file (array of 64 secret key bytes), ready to point WALLET_KEYPAIR_PATH
 * at for scripts/txline-test.ts.
 *
 * Run with:
 *   npx ts-node --transpile-only scripts/generate-devnet-wallet.ts [output-path]
 */
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

const outputPath = process.argv[2] ?? 'devnet-wallet.json';

const wallet = Keypair.generate();

fs.writeFileSync(outputPath, JSON.stringify(Array.from(wallet.secretKey)));

console.log('Public key:', wallet.publicKey.toBase58());
console.log('Saved to:', outputPath);
console.log(
  `Fund it: solana airdrop 2 ${wallet.publicKey.toBase58()} --url devnet`,
);
console.log(
  `Then run: WALLET_KEYPAIR_PATH=${outputPath} npx ts-node --transpile-only scripts/txline-test.ts`,
);
