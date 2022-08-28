import { Schema, model, Document, Types, ObjectId } from 'mongoose';
import { applyDefaultVirtuals } from '@utils/schema';

export interface IBusinessView extends Document {
    business: ObjectId;
    user: ObjectId;
    createdAt: Date;
}

const BusinessViewSchema = new Schema<IBusinessView>({
    business: { type: Types.ObjectId, ref: 'Business' },
    user: { type: Types.ObjectId, ref: 'User' },
    createdAt: { type: Date }
});

applyDefaultVirtuals(BusinessViewSchema);

BusinessViewSchema.index(
    { user: 1, business: 1, createdAt: 1 },
    { unique: true }
);

export const BusinessView = model<IBusinessView>(
    'BusinessView',
    BusinessViewSchema
);
