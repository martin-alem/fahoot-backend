import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';

@Schema({ autoCreate: true, collection: 'podium', timestamps: true })
export default class Podium extends Document<Types.ObjectId> {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Podium' })
  play: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Quiz' })
  quiz: Types.ObjectId;

  @Prop({ type: Object, required: true })
  firstPlace: object;

  @Prop({ type: Object, required: true })
  secondPlace: object;

  @Prop({ type: Object, required: true })
  thirdPlace: object;
}

export const PodiumSchema = SchemaFactory.createForClass(Podium);
