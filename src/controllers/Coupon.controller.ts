import { IController } from '../types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Coupon } from '../models';
import { generateAndGetCouponQRCodeUrl } from '../utils/qrcode';
import { ServerErrors } from '../types/ServerErrors';

export class CouponController implements IController {
    path: string = '/coupon';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getCoupons);
        this.router.post(`${this.path}`, this.createCoupon);
        this.router.get(`${this.path}/redeem-qr-code`, this.getRedeemQRCode);
    }

    private readonly getCoupons = async (
        req: Request<{}, {}, {}, { user: string }>,
        res: Response
    ) => {
        const { user } = req.query;

        return Coupon.find({ user })
            .populate([
                {
                    path: 'discount',
                    populate: { path: 'business', select: ['name', 'imageUrl'] }
                },
                { path: 'user', select: 'id' }
            ])
            .exec()
            .then((coupons) => {
                if (!coupons) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res.status(StatusCodes.OK).json(coupons);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly getRedeemQRCode = async (
        req: Request<{}, {}, {}, { coupon: string }>,
        res: Response
    ) => {
        const { coupon } = req.query;

        return Coupon.exists({ _id: coupon })
            .then(async (_) => {
                if (!_) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                const QRUrl = await generateAndGetCouponQRCodeUrl(coupon);
                return res.status(200).json(QRUrl);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly createCoupon = async (
        req: Request<{}, {}, { user: string; discount: string }>,
        res: Response
    ) => {
        const { user, discount } = req.body;

        return (await new Coupon({ user, discount }).save())
            .populate([
                {
                    path: 'discount',
                    populate: { path: 'business', select: ['name', 'imageUrl'] }
                },
                { path: 'user', select: 'id' }
            ])
            .then((coupon) => res.status(StatusCodes.OK).json(coupon))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };
}
