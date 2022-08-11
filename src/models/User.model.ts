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
    info: UserInfo;
    imageUrl: string;
    name: string;
}

const UserSchema = new Schema<IUser>({
    imageUrl: { type: String },
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
UserSchema.virtual('name').get(function (this) {
    return `${this.info.firstName} ${this.info.lastName}`;
});
applyDefaultVirtuals(UserSchema);

export const User = model<IUser>('User', UserSchema);
