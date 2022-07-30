import { Schema, Types } from 'mongoose';

export const applyDefaultVirtuals = (schema: Schema) => {
    schema.virtual('id').get(function (this: { _id: Types.ObjectId }) {
        return this._id.toHexString();
    });

    schema.set('toJSON', {
        transform: (_docs, ret) => {
            delete ret._id;
            return ret;
        },
        virtuals: true
    });
};
