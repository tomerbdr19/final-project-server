import { Schema, model, Document, Types, ObjectId } from 'mongoose';
import { IBusiness } from './Business.model';
import { IUser } from './User.model';

interface IAuthMethods {
    setPassword: (this: IAuth, password: string) => Promise<IAuth>;
}
export interface IAuth extends IAuthMethods, Document {
    user: ObjectId | IUser;
    business: ObjectId | IBusiness;
    email: string;
    password: string;
}

const AuthSchema = new Schema<IAuth>({
    user: { type: Types.ObjectId, ref: 'User' },
    business: { type: Types.ObjectId, ref: 'Business' },
    email: { type: String, unique: true, required: true },
    password: { type: String, unique: true, required: true }
});

const methods: IAuthMethods = {
    setPassword: async function (this: IAuth, password: string) {
        this.password = password;
        return await this.save();
    }
};

AuthSchema.method(methods);

export const Auth = model<IAuth>('Auth', AuthSchema);
