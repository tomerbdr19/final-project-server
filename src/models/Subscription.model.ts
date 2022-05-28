import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface ISubscriptionMethods {}
export interface ISubscription extends ISubscriptionMethods, Document {
    userId: ObjectId;
    businessId: ObjectId;
    createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
    userId: { type: Types.ObjectId, ref: 'User' },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    createdAt: { type: Date }
});

const methods: ISubscriptionMethods = {};

SubscriptionSchema.method(methods);

export const Subscription = model<ISubscription>(
    'Subscription',
    SubscriptionSchema
);
