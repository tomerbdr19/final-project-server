import 'dotenv/config';

const IS_DEV_MODE = process.env.NODE_ENV === 'dev';
export const UPLOAD_DIRECTORY_PATH = './uploads/';
export const QR_CODE_DIRECTORY_PATH = './QRcodes/';
export const SERVER_URL_BASE = IS_DEV_MODE
    ? 'http://localhost:3000/'
    : 'https://biz-app-server.azurewebsites.net/';
