import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IPostMethods {}
export interface IPost extends IPostMethods, Document {
    _id: ObjectId;
    businessId: ObjectId;
    content: string;
    src: string;
    createdAt: Date;
}

const PostSchema = new Schema<IPost>({
    _id: { type: Types.ObjectId },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    content: { type: String },
    src: { type: String },
    createdAt: { type: Date }
});

const methods: IPostMethods = {};

PostSchema.method(methods);

export const Post = model<IPost>('Post', PostSchema);
