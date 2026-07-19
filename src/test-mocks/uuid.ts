// Jest moduleNameMapper stub for `uuid`. The real `uuid@14` package ships
// ESM-only output (both `dist` and `dist-node`), which breaks Jest's default
// CJS transform for anything that transitively requires it — here that's
// rpc-websockets (used internally by @solana/web3.js's Connection), which
// only calls `uuid.v1()` to tag websocket messages. Node's built-in
// randomUUID is a drop-in replacement for that one call site.
import { randomUUID } from 'crypto';

export function v1(): string {
  return randomUUID();
}

export function v4(): string {
  return randomUUID();
}

export default { v1, v4 };
