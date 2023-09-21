import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SettingDTO {
  @IsNotEmpty()
  @IsUrl()
  lobbyMusic: string;

  @IsNotEmpty()
  @IsUrl()
  podiumMusic: string;

  @IsNotEmpty()
  @IsUrl()
  gameMusic: string;

  @IsNotEmpty()
  @IsString()
  colorLabel: string;
}
