import { Schema, model, Document } from 'mongoose';
import { applyDefaultVirtuals } from '@utils/schema';

type BusinessInfo = {
    info: {
        description: string;
        location: {
            country: string;
            city: string;
            street: string;
        };
        contact: {
            phone: string;
            email: string;
        };
    };
};

type BusinessTheme = {
    key: string;
};

interface IBusinessMethods {}
export interface IBusiness extends IBusinessMethods, Document {
    imageUrl: string;
    name: string;
    images: string[];
    info: BusinessInfo;
    theme: BusinessTheme;
}

const BusinessSchema = new Schema<IBusiness>({
    imageUrl: { type: String },
    name: { type: String },
    images: [{ type: String }],
    info: {
        description: { type: String },
        location: {
            country: { type: String },
            city: { type: String },
            street: { type: String }
        },
        contact: {
            phone: { type: String },
            email: { type: String }
        }
    },
    theme: {
        key: { type: String }
    }
});

const methods: IBusinessMethods = {};

BusinessSchema.method(methods);
applyDefaultVirtuals(BusinessSchema);

export const Business = model<IBusiness>('Business', BusinessSchema);
