import { Schema, Types, model } from 'mongoose';

const BusinessSchema = new Schema({
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
    users: {
        owners: [{ type: Types.ObjectId, ref: 'Admin' }],
        admins: [{ type: Types.ObjectId, ref: 'Admin' }],
        costumers: [{ type: Types.ObjectId, ref: 'Customer' }]
    }
});

export const Business = model('Business', BusinessSchema);
