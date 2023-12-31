import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../types/user.types';
import { AuthenticationMethod, CollectName, Status } from '../../../utils/constant';

@Schema({ autoCreate: true, collection: CollectName.USER, timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, lowercase: true })
  firstName: string;

  @Prop({ type: String, required: true, lowercase: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  emailAddress: string;

  @Prop({ type: String, required: false, default: null })
  password: string;

  @Prop({ type: String, enum: AuthenticationMethod, required: true })
  authenticationMethod: AuthenticationMethod;

  @Prop({ type: String, required: false, default: null })
  avatarUrl: string;

  @Prop({ type: Boolean, required: false, default: false })
  verified: boolean;

  @Prop({ type: String, required: false, enum: Status, default: Status.INACTIVE })
  status: Status;

  @Prop({ type: String, required: false, enum: UserRole, default: UserRole.CREATOR })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const session = this.$session();
  await this.$model('Quiz').deleteMany({ user: this._id }, { session: session });
  await this.$model('Token').deleteMany({ emailAddress: this.emailAddress }, { session: session });
  next();
});
