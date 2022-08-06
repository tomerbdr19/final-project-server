import { QR_CODE_DIRECTORY_PATH, SERVER_URL_BASE } from '../constants';
import QRcode from 'qrcode';
import fs from 'fs';

export const generateAndGetCouponQRCodeUrl = async (couponId: string) => {
    const qrPath = `${QR_CODE_DIRECTORY_PATH}${couponId}.png`;
    await QRcode.toFile(qrPath, `qr code for coupon: ${couponId}`, {
        margin: 1,
        width: 200
    });
    setTimeout(() => fs.unlink(qrPath, () => {}), 10000);
    return `${SERVER_URL_BASE}${couponId}.png`;
};
