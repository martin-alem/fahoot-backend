import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePlayDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isOpen: boolean;
}
