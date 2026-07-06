import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  totalData: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export function buildMeta(
  page: number,
  limit: number,
  totalData: number,
): PaginationMeta {
  return { page, limit, totalData, totalPages: Math.ceil(totalData / limit) };
}

export class ResponseWrapper {
  @ApiProperty({ description: 'The response data' })
  data: any;

  @ApiProperty({ description: 'The response message' })
  message?: string;

  @ApiProperty({ description: 'The response error' })
  error?: string;

  @ApiProperty({ description: 'The response status' })
  status: boolean;

  @ApiProperty({ description: 'The response meta' })
  meta?: PaginationMeta;
}
