import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IAdminMethods {}
export interface IAdmin extends IAdminMethods, Document {
    userId: ObjectId;
    businessId: ObjectId;
    isOwner: boolean;
}

const AdminSchema = new Schema<IAdmin>({
    userId: { type: Types.ObjectId, ref: 'User' },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    isOwner: { type: Boolean }
});

const methods: IAdminMethods = {};

AdminSchema.method(methods);

export const Admin = model<IAdmin>('Admin', AdminSchema);
