import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';
import { PLAYER_COLLECTION_NAME, Status } from 'src/utils/constant';

@Schema({ autoCreate: true, collection: PLAYER_COLLECTION_NAME, timestamps: true })
export class Player extends Document<Types.ObjectId> {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Play' })
  play: Types.ObjectId;

  @Prop({ type: String, required: true, lowercase: true })
  nickName: string;

  @Prop({ type: String, enum: Status, required: true })
  status: string;

  @Prop({ type: Number, required: false, default: 0 })
  points: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);

PlayerSchema.index({ play: 1, nickName: 1 }, { unique: true });
