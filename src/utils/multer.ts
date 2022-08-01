import { UPLOAD_DIRECTORY_PATH } from '../constants';
import e from 'express';
import multer from 'multer';

const SUPPORTED_TYPES = ['jpeg', 'jpg', 'png'];

const isSupportedType = (mimetype: string) =>
    SUPPORTED_TYPES.includes(mimetype.replace('image/', ''));

const storage = multer.diskStorage({
    destination: function (_req, _file, callback) {
        callback(null, UPLOAD_DIRECTORY_PATH);
    },
    filename: function (_req, file, callback) {
        callback(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (
    _req: e.Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
) => {
    if (isSupportedType(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

export const multerUpload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter
});
