import { Schema, Types, model } from 'mongoose';

const AdminSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User' },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    isOwner: { type: Boolean }
});

export const Admin = model('Admin', AdminSchema);
