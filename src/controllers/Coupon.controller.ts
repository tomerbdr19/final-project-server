import { IController, ServerErrors } from '@types';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Coupon, Discount } from '@models';
import { generateAndGetCouponQRCodeUrl } from '@utils/qrcode';
import { getActivityList } from '@utils/activity';
import moment from 'moment';
import axios from 'axios';
import { SIGNALR_SERVER_PATH } from '@constants';

export class CouponController implements IController {
    path: string = '/coupon';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getCoupons);
        this.router.post(`${this.path}`, this.createCoupon);
        this.router.post(`${this.path}/redeem`, this.redeemCoupon);
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
            .sort({ createdAt: -1 })
            .exec()
            .then((coupons) => {
                if (!coupons) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res
                    .status(StatusCodes.OK)
                    .json(coupons.filter((_) => _.discount !== null));
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

        const generateCode = () =>
            ['', '', '', '']
                .map(() => Math.round(Math.random() * 9).toString())
                .join('');

        const redeemCode = generateCode();

        return Coupon.findOneAndUpdate({ _id: coupon }, { redeemCode })
            .then(async (_) => {
                if (!_) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                const qrUrl = await generateAndGetCouponQRCodeUrl(redeemCode);
                return res.status(200).json({ qrUrl, redeemCode });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly redeemCoupon = async (
        req: Request<{}, {}, { business: string; code: string }>,
        res: Response
    ) => {
        const { business, code } = req.body;

        return Coupon.findOneAndUpdate(
            { business, redeemCode: code },
            { redeemedAt: new Date(), isRedeemed: true, redeemCode: null }
        )
            .then(async (coupon) => {
                if (!coupon) {
                    return res.status(400).json();
                }

                await axios
                    .post(`${SIGNALR_SERVER_PATH}redeemCoupon`, {
                        SendToId: coupon.user
                    })
                    .catch(() => console.log('signalR error'));

                return res.status(200).json(coupon);
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
