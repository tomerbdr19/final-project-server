import { applyDefaultVirtuals } from '../utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface ISubscriptionMethods {}
export interface ISubscription extends ISubscriptionMethods, Document {
    user: ObjectId;
    business: ObjectId;
    createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
    user: { type: Types.ObjectId, ref: 'User' },
    business: { type: Types.ObjectId, ref: 'Business' },
    createdAt: { type: Date }
});

const methods: ISubscriptionMethods = {};

SubscriptionSchema.method(methods);
applyDefaultVirtuals(SubscriptionSchema);

export const Subscription = model<ISubscription>(
    'Subscription',
    SubscriptionSchema
);
