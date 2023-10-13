import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';
import { PlayStatus } from 'src/utils/constant';

@Schema({ autoCreate: true, collection: 'plays', timestamps: true })
export class Play extends Document<Types.ObjectId> {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Quiz' })
  quiz: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, enum: PlayStatus, required: false, default: PlayStatus.PENDING })
  status: string;

  @Prop({ type: Boolean, required: false, default: true })
  isOpen: boolean;
}
export const PlaySchema = SchemaFactory.createForClass(Play);

PlaySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const session = this.$session();
  await this.$model('Player').deleteMany({ play: this._id }, { session: session });
  await this.$model('Podium').deleteMany({ play: this._id }, { session: session });
  next();
});
