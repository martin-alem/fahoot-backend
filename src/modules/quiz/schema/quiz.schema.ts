import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Question, QuestionSchema } from './question.schemaType';
import { SettingSchema, Settings } from './setting.schemaType';

@Schema({ autoCreate: true, collection: 'quizzes', timestamps: true })
export class Quiz {
  @Prop({ type: String, required: true, lowercase: true })
  title: string;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ type: SettingSchema, required: true })
  settings: Settings;
}

export type QuizDocument = Quiz & Document;
export const QuizSchema = SchemaFactory.createForClass(Quiz);
