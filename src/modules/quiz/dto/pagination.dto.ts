import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationDTO {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  pageSize: number;

  @IsString()
  @IsOptional()
  @IsIn(['createdAt'])
  sortField: string;

  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}
