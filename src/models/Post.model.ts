import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IPostMethods {}
export interface IPost extends IPostMethods, Document {
    businessId: ObjectId;
    content: string;
    imageUrl: string;
    createdAt: Date;
}

const PostSchema = new Schema<IPost>({
    businessId: { type: Types.ObjectId, ref: 'Business' },
    content: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date }
});

const methods: IPostMethods = {};

PostSchema.method(methods);

export const Post = model<IPost>('Post', PostSchema);
