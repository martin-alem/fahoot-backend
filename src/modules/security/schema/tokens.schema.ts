import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CollectName } from 'src/utils/constant';

@Schema({ autoCreate: true, collection: CollectName.TOKEN, timestamps: true })
export class Token extends Document<Types.ObjectId> {
  @Prop({ type: String, required: true, unique: true })
  token: string;

  @Prop({ type: String, required: true, unique: true })
  emailAddress: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
