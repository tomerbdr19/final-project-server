import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IPublishedPostMethods {}
export interface IPublishedPost extends IPublishedPostMethods, Document {
    _id: ObjectId;
    businessId: ObjectId;
    content: string;
    src: string;
    publishedAt: Date;
}

const PublishedPostSchema = new Schema<IPublishedPost>({
    _id: { type: Types.ObjectId },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    content: { type: String },
    src: { type: String },
    publishedAt: { type: Date }
});

const methods: IPublishedPostMethods = {};

PublishedPostSchema.method(methods);

export const PublishedPost = model<IPublishedPost>(
    'PublishedPost',
    PublishedPostSchema
);
