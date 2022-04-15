import { Schema, Types, model } from 'mongoose';

const SubscriptionSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User' },
  businessId: { type: Types.ObjectId, ref: 'Business' },
  createdAt: { type: Date }
});

export const Subscription = model('Subscription', SubscriptionSchema);
