import { IController } from '../types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Coupon } from '../models';

export class CouponController implements IController {
    path: string = '/coupon';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getCoupons);
        this.router.post(`${this.path}`, this.createCoupon);
        this.router.get(`${this.path}/redeem-code`, this.getRedeemCode);
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

    private readonly getRedeemCode = async (
        req: Request<{}, {}, { couponId: string }>,
        res: Response
    ) => {
        const { couponId } = req.body;
        throw 'not implemented';
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
