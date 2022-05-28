import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IFBTokenMethods {}
export interface IFBToken extends IFBTokenMethods, Document {
    businessId: ObjectId;
    token: string;
    createdAt: Date;
}

const FBTokenSchema = new Schema<IFBToken>({
    businessId: { type: Types.ObjectId, ref: 'Business' },
    token: { type: String },
    createdAt: { type: Date }
});

const methods: IFBTokenMethods = {};

FBTokenSchema.method(methods);

export const FBToken = model<IFBToken>('FBToken', FBTokenSchema);
