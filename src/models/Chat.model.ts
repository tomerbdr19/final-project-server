import { IMessage, Message } from '@models';
import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';
import { IBusiness } from './Business.model';
import { IUser } from './User.model';

interface IChatMethods {
    getChatMessages: () => Promise<IMessage[]>;
}
export interface IChat extends IChatMethods, Document {
    user: ObjectId | IUser;
    business: ObjectId | IBusiness;
    updatedAt: Date;
    createdAt: Date;
    status: 'new' | 'in-progress' | 'resolved';
}

const ChatSchema = new Schema<IChat>({
    user: { type: Types.ObjectId, ref: 'User', isRequired: true },
    business: { type: Types.ObjectId, ref: 'Business', isRequired: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    status: { type: String, default: 'new' }
});
ChatSchema.index({ user: 1, business: 1 }, { unique: true });

ChatSchema.method('getChatMessages', function (): Promise<IMessage[]> {
    const { user, business } = this;

    return Message.find({ chat: this.id })
        .sort({ createdAt: -1 })
        .then((messages) =>
            messages.map(
                ({ id, content, senderType, createdAt, chat }) =>
                    ({
                        id,
                        chat,
                        createdAt,
                        content,
                        senderType,
                        sender: senderType === 'user' ? user : business
                    } as IMessage)
            )
        );
});

applyDefaultVirtuals(ChatSchema);

export const Chat = model<IChat>('Chat', ChatSchema);
