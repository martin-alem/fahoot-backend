import { IsDate, IsOptional, IsString } from 'class-validator';
import { LEVEL } from '../../types/log.types';

export class FilterDTO {
  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsString()
  level?: LEVEL;

  @IsOptional()
  @IsString()
  hostIP?: string;

  @IsOptional()
  @IsString()
  hostName?: string;

  @IsOptional()
  @IsString()
  requestMethod?: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}
