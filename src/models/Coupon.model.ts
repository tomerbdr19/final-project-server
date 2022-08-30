import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';
import { IDiscount } from './Discount.model';
import { IUser } from './User.model';

interface ICouponMethods {}
export interface ICoupon extends ICouponMethods, Document {
    user: ObjectId | IUser;
    business: ObjectId;
    discount: ObjectId | IDiscount;
    isRedeemed: boolean;
    redeemedAt: Date;
    redeemCode: string;
}

const CouponSchema = new Schema<ICoupon>({
    user: { type: Types.ObjectId, ref: 'User' },
    business: { type: Types.ObjectId, ref: 'Business' },
    discount: { type: Types.ObjectId, ref: 'Discount' },
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date, default: null },
    redeemCode: { type: String }
});

const methods: ICouponMethods = {};

CouponSchema.method(methods);
applyDefaultVirtuals(CouponSchema);

export const Coupon = model<ICoupon>('Coupon', CouponSchema);
