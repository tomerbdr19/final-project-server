import { applyDefaultVirtuals } from '@utils/schema';
import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IProductMethods {}
export interface IProduct extends IProductMethods, Document {
    business: ObjectId;
    name: string;
    price: string;
    imageUrl: string;
}

const ProductSchema = new Schema<IProduct>({
    business: { type: Types.ObjectId, ref: 'Business' },
    name: { type: String },
    price: { type: String },
    imageUrl: { type: String }
});

const methods: IProductMethods = {};

ProductSchema.method(methods);
applyDefaultVirtuals(ProductSchema);

export const Product = model<IProduct>('Product', ProductSchema);
