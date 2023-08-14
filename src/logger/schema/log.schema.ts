import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ autoCreate: true, collection: 'logs', timestamps: true })
export class Log {
  @Prop({ type: String, required: false, default: null })
  event: string;

  @Prop({ type: String, required: false, default: null })
  level: string;

  @Prop({ type: String, required: false, default: null })
  description: string;

  @Prop({ type: String, required: false, default: null })
  hostIP: string;

  @Prop({ type: String, required: false, default: null })
  hostName: string;

  @Prop({ type: String, required: false, default: null })
  requestURI: string;

  @Prop({ type: String, required: false, default: null })
  requestMethod: string;

  @Prop({ type: String, required: false, default: null })
  userAgent: string;
}

export type LogDocument = Log & Document;
export const LogsSchema = SchemaFactory.createForClass(Log);
