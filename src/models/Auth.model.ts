import { Schema, model, Document, Types, ObjectId } from 'mongoose';
import { IUser } from './User.model';

interface IAuthMethods {
    setPassword: (this: IAuth, password: string) => Promise<IAuth>;
}
export interface IAuth extends IAuthMethods, Document {
    user: ObjectId | IUser;
    email: string;
    password: string;
}

const AuthSchema = new Schema<IAuth>({
    user: { type: Types.ObjectId, ref: 'User' },
    email: { type: String },
    password: { type: String }
});

const methods: IAuthMethods = {
    setPassword: async function (this: IAuth, password: string) {
        this.password = password;
        return await this.save();
    }
};

AuthSchema.method(methods);

export const Auth = model<IAuth>('Auth', AuthSchema);
