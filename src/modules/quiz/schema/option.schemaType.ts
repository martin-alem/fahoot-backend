import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class Option {
  @Prop({ type: Boolean, required: true })
  isCorrect: boolean;

  @Prop({ type: String, required: true, lowercase: true })
  option: string;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
