import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationDTO {
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  query: string;

  @IsNotEmpty()
  @IsNumber()
  pageSize: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['published', 'draft'])
  sortField: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}
