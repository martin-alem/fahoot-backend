import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Option, OptionSchema } from './option.schemaType';

export class Question {
  @Prop({ type: String, required: true, lowercase: true })
  title: string;

  @Prop({ type: [OptionSchema], required: true })
  options: Option[];

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: Number, required: true })
  points: number;

  @Prop({ type: String, required: false, default: null })
  mediaUrl: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
