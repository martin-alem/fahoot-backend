import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PlayStatus } from 'src/utils/constant';

export class PlayPaginationDTO {
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
  query: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn([PlayStatus.COMPLETED, PlayStatus.PENDING, PlayStatus.COMPLETED])
  sortField: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}
