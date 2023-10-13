import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';

@Schema({ autoCreate: true, collection: 'question_stats', timestamps: true })
export class AnswerStats extends Document<Types.ObjectId> {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Play' })
  play: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Quiz' })
  quiz: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  questionId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  answerId: Types.ObjectId;

  @Prop({ type: Number, required: false, default: 0 })
  points: number;

  @Prop({ type: Number, required: false, default: 0 })
  duration: number;

  @Prop({ type: Boolean, required: false, default: false })
  isCorrect: boolean;
}

export const AnswerStatsSchema = SchemaFactory.createForClass(AnswerStats);
