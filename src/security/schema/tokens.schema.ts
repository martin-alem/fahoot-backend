import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ autoCreate: true, collection: 'tokens', timestamps: true })
export class Token {
  @Prop({ type: String, required: true, unique: true })
  token: string;

  @Prop({ type: String, required: true })
  emailAddress: string;
}

export type TokenDocument = Token & Document;
export const TokenSchema = SchemaFactory.createForClass(Token);
