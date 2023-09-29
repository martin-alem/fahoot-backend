import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Option {
  @Prop({ type: Boolean, required: true })
  isCorrect: boolean;

  @Prop({ type: String, required: true, lowercase: true })
  option: string;

  @Prop({ type: String, required: true })
  colorLabel: string;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
