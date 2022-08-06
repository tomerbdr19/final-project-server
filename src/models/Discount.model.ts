import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';
import { IBusiness } from './Business.model';

interface IDiscountMethods {}
export interface IDiscount extends IDiscountMethods, Document {
    business: ObjectId | IBusiness;
    description: string;
    imageUrl: string;
    createdAt: Date;
    expiredAt: Date;
}

const DiscountSchema = new Schema<IDiscount>({
    business: { type: Types.ObjectId, ref: 'Business' },
    description: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date },
    expiredAt: { type: Date }
});

const methods: IDiscountMethods = {};

DiscountSchema.method(methods);
applyDefaultVirtuals(DiscountSchema);

export const Discount = model<IDiscount>('Discount', DiscountSchema);
