import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IMessageMethods {}
export interface IMessage extends IMessageMethods, Document {
    MessageId: ObjectId;
    fromUserId: ObjectId;
    fromBusinessId: ObjectId;
    content: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    MessageId: { type: Types.ObjectId },
    fromUserId: { type: Types.ObjectId, ref: 'User' },
    fromBusinessId: { type: Types.ObjectId, ref: 'Business' },
    content: { type: String },
    createdAt: { type: Date }
});

const methods: IMessageMethods = {};

MessageSchema.method(methods);

export const Message = model<IMessage>('Message', MessageSchema);
