import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';

export class KeeperStatusData {
  @ApiProperty({
    description:
      'Whether SOLANA_KEEPER_SECRET_KEY is set and loaded in this environment.',
  })
  configured: boolean;

  @ApiProperty({
    nullable: true,
    description: 'Keeper wallet public key, or null if not configured.',
  })
  publicKey: string | null;

  @ApiProperty({
    nullable: true,
    description:
      'Keeper on-chain balance in SOL, or null if not configured / RPC ' +
      'unreachable. Must be funded to run initializeMarket and settle.',
  })
  balanceSol: number | null;

  @ApiProperty({ description: 'Solana RPC endpoint the backend is using.' })
  rpcUrl: string;
}

export class KeeperStatusResponse extends OmitType(ResponseWrapper, ['meta']) {
  @ApiProperty({ type: KeeperStatusData })
  declare data: KeeperStatusData;
}
