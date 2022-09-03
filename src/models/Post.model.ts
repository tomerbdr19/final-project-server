import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';
import { IBusiness } from './Business.model';

interface IPostMethods {}
export interface IPost extends IPostMethods, Document {
    business: ObjectId | IBusiness;
    caption: string;
    imageUrl: string;
    discount: ObjectId | null;
    createdAt: Date;
}

const PostSchema = new Schema<IPost>({
    business: { type: Types.ObjectId, ref: 'Business' },
    discount: { type: Types.ObjectId, ref: 'Discount', default: null },
    caption: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date, default: new Date() }
});

const methods: IPostMethods = {};

applyDefaultVirtuals(PostSchema);
PostSchema.method(methods);

export const Post = model<IPost>('Post', PostSchema);
