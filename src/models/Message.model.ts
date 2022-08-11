import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';
import { IBusiness } from './Business.model';
import { IUser } from './User.model';

interface IMessageMethods {}
export interface IMessage extends IMessageMethods, Document {
    chat: ObjectId;
    sender: ObjectId | IUser | IBusiness;
    senderType: 'user' | 'business';
    content: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    chat: { type: Types.ObjectId, ref: 'Chat', isRequired: true },
    senderType: { type: String, isRequired: true },
    sender: { type: Types.ObjectId, refPath: 'senderType', isRequired: true },
    content: { type: String, isRequired: true },
    createdAt: { type: Date, default: new Date() }
});

const methods: IMessageMethods = {};

applyDefaultVirtuals(MessageSchema);
MessageSchema.method(methods);

export const Message = model<IMessage>('Message', MessageSchema);
