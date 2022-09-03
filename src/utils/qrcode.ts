import 'dotenv/config';
import { QR_CODE_DIRECTORY_PATH } from '../constants';
import QRcode from 'qrcode';
import fs from 'fs';

export const generateAndGetCouponQRCodeUrl = async (couponId: string) => {
    const qrPath = `${QR_CODE_DIRECTORY_PATH}${couponId}.png`;
    await QRcode.toFile(qrPath, `qr code for coupon: ${couponId}`, {
        margin: 1,
        width: 200
    });
    setTimeout(() => fs.unlink(qrPath, () => {}), 10000);
    return `${process.env.BASE_URL || 'http://localhost:3000/'}${couponId}.png`;
};
