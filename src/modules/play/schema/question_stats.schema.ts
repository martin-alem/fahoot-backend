import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';
import { QuestionDifficulty } from 'src/utils/constant';

@Schema({ autoCreate: true, collection: 'question_stats', timestamps: true })
export class QuestionStats extends Document<Types.ObjectId> {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Play' })
  play: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Quiz' })
  quizId: Types.ObjectId;

  @Prop({ type: Number, required: false, default: 0 })
  noPass: number;

  @Prop({ type: Number, required: false, default: 0 })
  score: number;

  @Prop({ type: String, enum: QuestionDifficulty, required: false, default: QuestionDifficulty.EASY })
  difficulty: string;
}

export const QuestionStatsSchema = SchemaFactory.createForClass(QuestionStats);
