import { Schema, Types, model, Document, ObjectId } from 'mongoose';

interface IUser extends Document {
  _id: ObjectId
  session: {
    tokenId: string
  }
  info: {
    firstName: string
    lastName: string
    birthDate: Date
    region: string
    city: string
  }
  type: UserPermissions
}

type UserPermissions = 'owner' | 'admin' | 'customer';

const UserSchema = new Schema<IUser>({
  _id: { type: Types.ObjectId },
  session: {
    tokenId: { type: String }
  },
  info: {
    firstName: { type: String },
    lastName: { type: String },
    birthDate: { type: Date },
    region: { type: String },
    city: { type: String }
  },
  type: { type: String }
});

export const User = model<IUser>('User', UserSchema);
