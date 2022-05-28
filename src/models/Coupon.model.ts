import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface ICouponMethods {}

type CouponStatus = 'expired' | 'redeemed' | 'available';

export interface ICoupon extends ICouponMethods, Document {
    _id: ObjectId;
    businessId: ObjectId;
    userId: ObjectId;
    discountId: ObjectId;
    createdAt: Date;
    expiredAt: Date;
    status: CouponStatus;
    isClaimed: boolean;
}

const CouponSchema = new Schema<ICoupon>({
    _id: { type: Types.ObjectId },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    userId: { type: Types.ObjectId, ref: 'User' },
    discountId: { type: Types.ObjectId, ref: 'Discount' },
    createdAt: { type: Date },
    expiredAt: { type: Date },
    status: { type: String },
    isClaimed: { type: Boolean }
});

const methods: ICouponMethods = {};

CouponSchema.method(methods);

export const Coupon = model<ICoupon>('Coupon', CouponSchema);
