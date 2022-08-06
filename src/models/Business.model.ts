import { Schema, model, Document, ObjectId, Types } from 'mongoose';
import { applyDefaultVirtuals } from '@utils/schema';

type BusinessInfo = {
    info: {
        location: {
            country: string;
            city: string;
            street: string;
        };
        contact: {
            phones: string[];
            email: string[];
        };
    };
};

interface IBusinessMethods {}
export interface IBusiness extends IBusinessMethods, Document {
    imageUrl: string;
    name: string;
    info: BusinessInfo;
    ownerId: ObjectId;
}

const BusinessSchema = new Schema<IBusiness>({
    imageUrl: { type: String },
    name: { type: String },
    info: {
        name: { type: String },
        location: {
            country: { type: String },
            city: { type: String },
            street: { type: String }
        },
        contact: {
            phones: [{ type: String }],
            email: [{ type: String }]
        }
    },
    ownerId: { type: Types.ObjectId, ref: 'User' }
});

const methods: IBusinessMethods = {};

BusinessSchema.method(methods);
applyDefaultVirtuals(BusinessSchema);

export const Business = model<IBusiness>('Business', BusinessSchema);
