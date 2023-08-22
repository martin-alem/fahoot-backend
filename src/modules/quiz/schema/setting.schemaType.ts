import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class Settings {
  @Prop({ type: String, required: false, default: null })
  lobbyMusic: string;

  @Prop({ type: String, required: false, default: null })
  podiumMusic: string;

  @Prop({ type: String, required: false, default: null })
  gameMusic: string;
}

export const SettingSchema = SchemaFactory.createForClass(Settings);
