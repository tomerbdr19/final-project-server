import { IController, ServerErrors } from '@types';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Coupon, Discount } from '@models';
import { generateAndGetCouponQRCodeUrl } from '@utils/qrcode';
import { getActivityList } from '@utils/activity';
import moment from 'moment';

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
        this.router.get(`${this.path}/activity`, this.couponsActivity);
        this.router.get(`${this.path}/b`, this.bla);
    }

    private readonly getCoupons = async (
        req: Request<{}, {}, {}, { user: string }>,
        res: Response
    ) => {
        const { user } = req.query;

        return Coupon.find({ user })
            .populate('user')
            .populate({ path: 'discount', populate: { path: 'business' } })
            .exec()
            .then((coupons) => {
                if (!coupons) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res.status(StatusCodes.OK).json(coupons);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly bla = async (
        req: Request<{}, {}, {}, { user: string }>,
        res: Response
    ) => {
        return Coupon.find({ discount: '6317a04cdf111c5d2a293264' })
            .then(async (coupons) => {
                coupons.forEach(async (coupon, index) => {
                    if (index % 5 !== 0) {
                        const day = Math.random() * 10 * 6;

                        const date = moment(new Date()).subtract(day, 'day');
                        await Coupon.findByIdAndUpdate(coupon.id, {
                            isRedeemed: true,
                            redeemedAt: date
                        });
                    }

                    return res.status(200).json();
                });
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

        const business = await Discount.findById(discount).then(
            (_) => _?.business
        );

        return new Coupon({ user, discount, business })
            .save()
            .then((_) =>
                _.populate([
                    {
                        path: 'discount',
                        populate: {
                            path: 'business',
                            select: ['name', 'imageUrl']
                        }
                    },
                    { path: 'user', select: 'id' }
                ])
            )
            .then((coupon) => res.status(StatusCodes.OK).json(coupon))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly couponsActivity = async (
        req: Request<
            {},
            {},
            {},
            { business: string; period: 'day' | 'week' | 'month' }
        >,
        res: Response
    ) => {
        const { business, period } = req.query;

        const activities = getActivityList(period);

        return Discount.find({ business })
            .then((discounts) =>
                Promise.all(
                    activities.map(({ from, to, label }) =>
                        Coupon.find({
                            discount: { $in: discounts },
                            redeemedAt: { $gte: from, $lte: to }
                        })
                            .countDocuments()
                            .then((value) => ({ label, value }))
                    )
                ).then((_) => res.status(StatusCodes.OK).json(_))
            )
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };
}
