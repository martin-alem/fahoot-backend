import { IsNotEmpty, IsString } from 'class-validator';

export class ExtraUploadDataDTO {
  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsNotEmpty()
  @IsString()
  acl: string;
}
