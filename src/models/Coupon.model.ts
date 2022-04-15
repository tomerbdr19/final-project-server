import { Schema, Types, model } from 'mongoose';

const CouponSchema = new Schema({
  businessId: { type: Types.ObjectId, ref: 'Business' },
  code: { type: String },
  createdAt: { type: Date },
  expiredAt: { type: Date }
});

export const Coupon = model('Coupon', CouponSchema);
