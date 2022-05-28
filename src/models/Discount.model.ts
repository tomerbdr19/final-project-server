import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IDiscountMethods {}

type DiscountType = 'percentage' | 'new price' | 'amount' | 'free item';

export interface IDiscount extends IDiscountMethods, Document {
    businessId: ObjectId;
    createdAt: Date;
    type: DiscountType;
}

const DiscountSchema = new Schema<IDiscount>({
    _id: { type: Types.ObjectId },
    businessId: { type: Types.ObjectId, ref: 'Business' },
    createdAt: { type: Date },
    type: { type: String }
});

const methods: IDiscountMethods = {};

DiscountSchema.method(methods);

export const Discount = model<IDiscount>('Discount', DiscountSchema);
