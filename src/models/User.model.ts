import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';

type UserInfo = {
    firstName: string;
    lastName: string;
    birthDate: Date;
    region: string;
    city: string;
};

interface IUserMethods {}
export interface IUser extends IUserMethods, Document {
    _id: ObjectId;
    info: UserInfo;
}

const UserSchema = new Schema<IUser>({
    _id: { type: Types.ObjectId, default: new Types.ObjectId() },
    info: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        birthDate: { type: Date, default: undefined },
        region: { type: String, default: '' },
        city: { type: String, default: '' }
    }
});

const methods: IUserMethods = {};

UserSchema.method(methods);
applyDefaultVirtuals(UserSchema);

export const User = model<IUser>('User', UserSchema);
