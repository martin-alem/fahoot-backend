import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QuizPaginationDTO {
  @IsNotEmpty()
  @IsInt()
  @Transform((value) => parseInt(value.value, 10))
  page: number;

  @IsNotEmpty()
  @IsInt()
  @Transform((value) => parseInt(value.value, 10))
  pageSize: number;

  @IsString()
  @IsOptional()
  query: string;

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
