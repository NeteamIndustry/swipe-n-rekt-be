import { ApiProperty } from '@nestjs/swagger';

export class ResponseWrapper {
  @ApiProperty({
    description: 'The response data',
  })
  data: any;

  @ApiProperty({
    description: 'The response message',
  })
  message?: string;

  @ApiProperty({
    description: 'The response error',
  })
  error?: string;

  @ApiProperty({
    description: 'The response status',
  })
  status: boolean;
}
