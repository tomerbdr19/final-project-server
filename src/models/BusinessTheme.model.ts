import { Schema, model, Document, ObjectId, Types } from 'mongoose';

interface IBusinessThemeMethods {}

type DesignableComponents =
    | 'top card'
    | 'background'
    | 'primary text'
    | 'secondary text';

export interface IBusinessTheme extends IBusinessThemeMethods, Document {
    businessId: ObjectId;
    theme: Record<DesignableComponents, string>;
}

const BusinessThemeSchema = new Schema<IBusinessTheme>({
    businessId: { type: Types.ObjectId, ref: 'Business' },
    theme: { type: String, of: String }
});

const methods: IBusinessThemeMethods = {};

BusinessThemeSchema.method(methods);

export const BusinessTheme = model<IBusinessTheme>(
    'BusinessTheme',
    BusinessThemeSchema
);
