import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';
import { CardEntity } from '../../card/entities/card.entity';

export class OpenPackRequest {
  @ApiProperty({ description: 'ID of the user pack to open' })
  @IsUUID()
  userPackId: string;
}

export class OpenPackData {
  @ApiProperty({ description: 'Rarity of the pack that was opened' })
  packRarity: string;

  @ApiProperty({
    type: CardEntity,
    isArray: true,
    description: 'Cards awarded from opening the pack',
  })
  cards: CardEntity[];

  @ApiProperty({
    description: 'Remaining quantity of this pack rarity left in inventory',
  })
  remainingQuantity: number;
}

export class OpenPackResponse extends OmitType(ResponseWrapper, [
  'meta',
] as const) {
  @ApiProperty({ type: OpenPackData })
  declare data: OpenPackData;
}
