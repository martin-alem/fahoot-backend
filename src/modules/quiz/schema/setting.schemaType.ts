import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Settings {
  @Prop({ type: String, required: true })
  lobbyMusic: string;

  @Prop({ type: String, required: true })
  podiumMusic: string;

  @Prop({ type: String, required: true })
  gameMusic: string;

  @Prop({ type: String, required: true })
  colorLabel: string;
}

export const SettingSchema = SchemaFactory.createForClass(Settings);
