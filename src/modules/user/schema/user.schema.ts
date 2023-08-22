import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/types/user.types';
import { Status } from 'src/utils/constant';

@Schema({ autoCreate: true, collection: 'users', timestamps: true })
export class User {
  @Prop({ type: String, required: true, lowercase: true })
  firstName: string;

  @Prop({ type: String, required: true, lowercase: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  emailAddress: string;

  @Prop({ type: String, required: false, default: null })
  password: string;

  @Prop({ type: String, required: false, default: null })
  avatarUrl: string;

  @Prop({ type: Boolean, required: false, default: false })
  verified: boolean;

  @Prop({ type: String, required: false, enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({ type: String, required: false, enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
