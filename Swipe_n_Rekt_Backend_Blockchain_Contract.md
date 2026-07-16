# Swipe n Rekt — Kontrak Antarmuka Backend ↔ Blockchain

Dokumen ini biar **backend & blockchain bisa jalan paralel** tanpa saling nungguin.
Prinsip: sepakati **bentuk data + nama instruction** dulu. Setelah itu, blockchain ngoding contract, backend ngoding pakai mock, nanti tinggal disambung.

---

## 1. Pembagian tanggung jawab

| | Blockchain (Anchor/Solana) | Backend (NestJS) |
|---|---|---|
| Escrow USDC | ✅ nyimpen & ngunci dana | ❌ gak pernah pegang dana |
| Verifikasi hasil | ✅ Merkle proof + CPI validate_stat | ❌ cuma relay proof |
| Payout | ✅ eksekusi transfer | ❌ cuma trigger |
| Reward pool | ✅ nyimpen & distribusi | ❌ cuma hitung eligibility |
| Mint cNFT | ✅ mint ke wallet | ❌ cuma trigger + simpan referensi |
| Supply counter | ✅ enforce cap (kalau on-chain) | 🟡 mirror di DB buat query cepat |
| Data TxODDS (odds/scores) | ❌ | ✅ tarik & parse SSE |
| Generate kartu & harga | ❌ | ✅ |
| Streak, album, leaderboard | ❌ | ✅ |
| Market-maker bot | ❌ | ✅ (manggil contract pas perlu) |

**Aturan:** on-chain = DUIT & BUKTI. Sisanya backend.

---

## 2. Yang HARUS disepakati di awal (blocker paralel)

Ini yang bikin dua sisi bisa jalan sendiri. Fix ini dulu sebelum ngoding.

### A. Nama & signature instruction (contract)
Backend butuh tau ini buat bikin wrapper di `SolanaModule`.

```
place_bet(market_id, side, amount, user)
  → lock USDC ke escrow, potong fee ke pool
  → emit event: BetPlaced { market_id, user, side, amount, position_id }

settle_market(market_id, merkle_proof, outcome_data)
  → CPI ke TxLINE validate_stat
  → bayar pemenang dari escrow
  → emit event: MarketSettled { market_id, winning_side, total_payout }

mint_card(user, catalog_id, rarity)
  → mint cNFT + increment supply counter
  → gagal kalau supply cap kena
  → emit event: CardMinted { user, catalog_id, mint_address }

claim_set_reward(user, country, period)
  → payout dari reward pool
  → emit event: SetRewardClaimed { user, country, amount }
```

> **TODO (blockchain):** konfirmasi signature final + IDL. Backend nunggu ini buat bikin typed client.

### B. Identifier yang dipakai dua sisi
Harus konsisten, jangan beda format.

| Field | Format | Contoh | Dipakai di |
|---|---|---|---|
| `market_id` | string / pubkey PDA | derive dari `fixture_id + market_type + window` | place_bet, settle_market |
| `position_id` | u64 / pubkey | auto dari contract | tracking posisi |
| `catalog_id` | u32 | index pemain dari CSV (1-1248) | mint_card |
| `user` | pubkey (wallet) | `7xKp...9fA2` | semua |
| `country` | string / u8 enum | "Argentina" / 0-47 | claim_set_reward |

> **KEPUTUSAN:** `market_id` mau derive dari apa? Ini yang bikin backend & contract bisa refer ke market yang sama. Saran: PDA dari seed `[b"market", fixture_id, market_type, window_start]`.

### C. Event yang di-emit contract
Backend **dengerin event ini** buat sinkron DB. Format harus fix.

- `BetPlaced` → backend catat posisi
- `MarketSettled` → backend update hasil, hitung streak, trigger pack
- `CardMinted` → backend update `collection.cnft_mint`
- `SetRewardClaimed` → backend catat klaim

> **TODO (blockchain):** kirim contoh event log / IDL biar backend bisa parse.

---

## 3. Yang backend siapin (bisa mulai SEKARANG, gak nunggu contract)

### 3.1 Bisa jalan penuh tanpa blockchain
- ✅ **TxoddsModule** — auth, SSE odds + scores, parse payload, simpan Merkle proof
- ✅ **CardsModule** — generate kartu dari odds, tentuin window & harga
- ✅ **MarketModule** — pricing (implied probability dari odds), tracking posisi (di DB), exposure/cap
- ✅ **GameModule** — streak, reward mapping, pack roll, album, set completion detection
- ✅ **UsersModule** — wallet auth (verify signature), profil, stats
- ✅ **RealtimeGateway** — WebSocket push ke frontend
- ✅ **Database schema** — semua tabel
- ✅ **Import CSV** 1248 pemain ke `card_catalog`

### 3.2 Butuh mock dulu (nanti diganti call contract beneran)
Backend bikin `SolanaService` dengan **interface tetap**, isinya mock dulu:

```ts
// solana/solana.service.ts — INTERFACE FINAL, isi diganti nanti
interface SolanaService {
  placeBet(marketId, side, amount, userWallet): Promise<{ txSig, positionId }>
  settleMarket(marketId, merkleProof, outcome): Promise<{ txSig, payouts }>
  mintCard(userWallet, catalogId, rarity): Promise<{ txSig, mintAddress }>
  claimSetReward(userWallet, country, period): Promise<{ txSig, amount }>
  getSupplyCount(catalogId): Promise<number>
  getPoolBalance(): Promise<number>
  getUserBalance(wallet): Promise<number>
}
```

**Mock version** (buat minggu 1): return dummy txSig, simulasi delay, update DB langsung.
**Real version** (setelah contract jadi): panggil Anchor client.

> Selama interface-nya sama, **swap mock → real gak perlu ubah kode modul lain.** Ini kunci paralelisasi.

### 3.3 Yang backend SIAPIN buat blockchain
Blockchain butuh data ini dari backend — pastiin formatnya jelas:

| Butuh apa | Dari backend | Kapan |
|---|---|---|
| Merkle proof | `TxoddsModule` simpan proof tiap event | Saat settle |
| Outcome data | Hasil event (gol/corner terjadi atau enggak) | Saat settle |
| Market params | fixture_id, market_type, window, harga | Saat create market |
| Catalog rarity | dari `card_catalog` (CSV) | Saat mint |
| Set completion status | dari `set_progress` | Saat claim reward |

---

## 4. Yang blockchain siapin (paralel)

- [ ] Program Anchor: escrow USDC, PDA structure
- [ ] Instruction: `place_bet`, `settle_market`, `mint_card`, `claim_set_reward`
- [ ] CPI ke TxLINE `validate_stat` (lihat repo `txodds/tx-on-chain`, folder `idl/` & `types/`)
- [ ] Reward pool PDA (nampung fee, distribusi)
- [ ] Supply counter per `catalog_id` (enforce cap)
- [ ] cNFT minting (compressed NFT, Bubblegum/Metaplex)
- [ ] Deploy devnet
- [ ] **Kirim ke backend:** IDL file + program ID + contoh event log

### Info TxLINE yang udah diketahui (dari TG)
```
Mainnet program ID: 9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA
Subscription token mint: Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL
Free tier: serviceLevelId = 1 (WC + friendlies, 60s delay) | 12 (real-time)
           durationWeeks = 4, selectedLeagues = []
PDAs: pricingMatrixPda seed "pricing_matrix"
      tokenTreasuryPda seed "token_treasury_v2"
      tokenTreasuryVault = ATA untuk TxL mint, owned by tokenTreasuryPda, TOKEN_2022_PROGRAM_ID
IDL/types: repo publik txodds/tx-on-chain → folder idl/ dan types/
Mobile: pakai wallet/mobile wallet adapter signing (JANGAN provider.wallet.payer.secretKey)
```

---

## 5. Urutan integrasi (biar gak chaos)

**Minggu 1 — paralel penuh**
- Backend: semua modul off-chain + SolanaService **versi mock**
- Blockchain: setup Anchor, escrow, `place_bet` + `settle_market` (mock CPI dulu)
- **Sync point:** sepakati nama instruction + identifier format (section 2)

**Minggu 2 — integrasi inti**
- Blockchain: kirim **IDL + program ID devnet** ke backend
- Backend: swap mock → real Anchor client (interface gak berubah)
- Test end-to-end: swipe → place_bet on-chain → settle → payout
- **Blocker kritis:** CPI `validate_stat` harus jalan. Prioritas #1.

**Minggu 3 — pembeda**
- Blockchain: `mint_card`, `claim_set_reward`, supply counter
- Backend: sambungin ke GameModule
- Poles + demo

---

## 6. Cara test tanpa nunggu satu sama lain

**Backend test tanpa contract:**
- Pakai `SolanaService` mock → semua flow bisa dites (swipe, streak, pack, album)
- Simulasi settle: manual trigger, langsung update DB

**Blockchain test tanpa backend:**
- Unit test Anchor pakai dummy data
- Script test manual (ts-node) buat panggil instruction

**Titik temu:** begitu IDL keluar, backend generate typed client → swap mock. Kalau interface (section 2A) disepakati bener, ini cuma ganti isi fungsi, gak rombak apa-apa.

---

## 7. Checklist sinkronisasi (isi bareng)

- [ ] Nama & signature instruction final
- [ ] Format `market_id` (PDA seed)
- [ ] Format `catalog_id` (mapping ke CSV)
- [ ] Struktur event log
- [ ] IDL file dikirim ke backend
- [ ] Program ID devnet
- [ ] Format Merkle proof yang diterima `settle_market`
- [ ] Fee percentage (berapa % masuk pool)
- [ ] USDC mint address (devnet)
