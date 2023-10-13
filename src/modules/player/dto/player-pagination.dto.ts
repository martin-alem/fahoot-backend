import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PlayerPaginationDTO {
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
  @IsNotEmpty()
  @IsIn(['createdAt'])
  sortField: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}
