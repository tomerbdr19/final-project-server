import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IChatMethods {}
export interface IChat extends IChatMethods, Document {
    _id: ObjectId;
    userId: ObjectId;
    businessId: ObjectId;
    createdAt: Date;
}

const ChatSchema = new Schema<IChat>({
    _id: { type: Types.ObjectId },
    userId: { type: Types.ObjectId, ref: 'User' },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    createdAt: { type: Date }
});

const methods: IChatMethods = {};

ChatSchema.method(methods);

export const Chat = model<IChat>('Chat', ChatSchema);
