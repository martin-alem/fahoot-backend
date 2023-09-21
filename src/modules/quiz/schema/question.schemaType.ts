import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Option, OptionSchema } from './option.schemaType';
import { arrayLimitValidator } from './../../../utils/helper';
import { MAX_QUESTION_PER_QUIZ, QuestionType } from './../../../utils/constant';

export class Question {
  @Prop({ type: String, required: true, lowercase: true })
  title: string;

  @Prop({ type: String, enum: QuestionType, required: true })
  questionType: string;

  @Prop({ type: [OptionSchema], required: true, validate: [arrayLimitValidator(MAX_QUESTION_PER_QUIZ)] })
  options: Option[];

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: Number, required: true })
  points: number;

  @Prop({ type: String, required: false, default: null })
  mediaUrl: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
