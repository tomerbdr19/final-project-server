import { Schema, Types, model, Document, ObjectId } from 'mongoose';

interface IUser extends Document {
  _id: ObjectId
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
  _id: { type: Types.ObjectId, default: new Types.ObjectId() },
  info: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    birthDate: { type: Date, default: undefined },
    region: { type: String, default: '' },
    city: { type: String, default: '' }
  },
  type: { type: String, default: 'customer' }
});

export const User = model<IUser>('User', UserSchema);
