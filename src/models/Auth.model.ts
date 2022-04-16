import { Schema, model, Document } from 'mongoose';

interface IAuthMethods {
  setPassword: (this: IAuth, password: string) => Promise<IAuth>
}
export interface IAuth extends IAuthMethods, Document {
  userId: string
  email: string
  password: string
}

const AuthSchema = new Schema<IAuth>({
  userId: { type: String, ref: 'User' },
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
