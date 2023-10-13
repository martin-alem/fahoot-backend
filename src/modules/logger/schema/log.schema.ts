import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ autoCreate: true, collection: 'logs', timestamps: true })
export class Log extends Document<Types.ObjectId> {
  @Prop({ type: String, required: false, default: null })
  event: string;

  @Prop({ type: String, required: false, default: null })
  level: string;

  @Prop({ type: String, required: false, default: null })
  description: string;
}

export const LogsSchema = SchemaFactory.createForClass(Log);
