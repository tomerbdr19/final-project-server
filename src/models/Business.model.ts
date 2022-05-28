import { Schema, model, Document, ObjectId, Types } from 'mongoose';

type BusinessInfo = {
    info: {
        name: string;
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
    _id: ObjectId;
    info: BusinessInfo;
    ownerId: ObjectId;
}

const BusinessSchema = new Schema<IBusiness>({
    _id: { type: Types.ObjectId },
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

export const Business = model<IBusiness>('Business', BusinessSchema);
