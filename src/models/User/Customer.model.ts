import { Schema, Types, model } from 'mongoose';
import { Subscription } from '../';

const CustomerSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User' },
  subscriptions: { type: [Subscription] },
  coupons: {
    all: [{ type: Types.ObjectId, ref: 'Coupon' }],
    claimed: [{ type: Types.ObjectId, ref: 'Coupon' }]
  }
});

export const Customer = model('Customer', CustomerSchema);
