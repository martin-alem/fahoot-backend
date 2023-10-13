import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Question, QuestionSchema } from './question.schemaType';
import { SettingSchema, Settings } from './setting.schemaType';
import { arrayLimitValidator } from './../../../utils/helper';
import { MAX_QUESTION_PER_QUIZ, QuizStatus } from './../../../utils/constant';

@Schema({ autoCreate: true, collection: 'quizzes', timestamps: true })
export class Quiz extends Document<Types.ObjectId> {
  @Prop({ type: String, required: true, lowercase: true })
  title: string;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String, enum: QuizStatus, required: false, default: QuizStatus.DRAFT })
  status: string;

  @Prop({ type: [QuestionSchema], required: true, validate: [arrayLimitValidator(MAX_QUESTION_PER_QUIZ)] })
  questions: Question[];

  @Prop({ type: SettingSchema, required: true })
  settings: Settings;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const session = this.$session();
  await this.$model('Play').deleteMany({ quiz: this._id }, { session: session });
  next();
});
