/**
 * Standalone script — NOT part of the Nest app, not wired into any module.
 * Sanity-checks the TxLine `/api/fixtures/snapshot` endpoint using an
 * already-activated API token + guest JWT (see scripts/txline-test.ts for
 * how those are obtained).
 *
 * Requires TXLINE_TOKEN and TXLINE_JWT set in .env.
 *
 * Run with:
 *   npx ts-node --transpile-only scripts/txline-competition-test.ts
 */
import { config } from 'dotenv';
config();

import axios from 'axios';

const apiToken = process.env.TXLINE_TOKEN;
const jwt = process.env.TXLINE_JWT;

if (!apiToken || !jwt) {
  throw new Error(
    'Missing TXLINE_TOKEN and/or TXLINE_JWT in .env — set both before running this script.',
  );
}

const httpClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
    'X-Api-Token': apiToken,
  },
  baseURL: 'https://txline.txodds.com',
});

interface Fixture {
  FixtureId: number;
  Participant1: string;
  Participant2: string;
  Participant1IsHome: boolean;
  StartTime: string;
  GameState?: string;
  gameState?: string;
}

async function main() {
  // Get fixtures for specific competition
  const fixturesResponse = await httpClient.get<Fixture[]>(
    '/api/fixtures/snapshot',
    {
      params: {
        competitionId: 72, // NCAA Division I FBS
      },
    },
  );
  const fixtures = fixturesResponse.data;

  console.log(`Retrieved ${fixtures.length} fixtures`);
  fixtures.slice(0, 3).forEach((fixture, index) => {
    const homeTeam = fixture.Participant1IsHome
      ? fixture.Participant1
      : fixture.Participant2;
    const awayTeam = fixture.Participant1IsHome
      ? fixture.Participant2
      : fixture.Participant1;

    console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
    console.log(
      `   ID: ${fixture.FixtureId}, Start: ${new Date(fixture.StartTime).toISOString()}`,
    );
    console.log(`   GameState: ${fixture.GameState ?? fixture.gameState}`);
  });

  // Get all fixtures
  const allFixturesResponse = await httpClient.get<Fixture[]>(
    '/api/fixtures/snapshot',
  );
  const allFixtures = allFixturesResponse.data;

  console.log(`Retrieved ${allFixtures.length} total fixtures`);
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
