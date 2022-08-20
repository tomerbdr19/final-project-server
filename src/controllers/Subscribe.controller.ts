import { IController } from '@types';
import { filterToQuery, getTruthyFilters } from '@utils/filter';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    Coupon,
    IBusiness,
    IDiscount,
    ISubscription,
    IUser,
    Subscription
} from '@models';

export class SubscribeController implements IController {
    path: string = '/subscribe';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getSubscriptions);
        this.router.get(`${this.path}`, this.createSubscription);
        this.router.post(`${this.path}/filter`, this.getFilteredSubscriptions);
        this.router.post(`${this.path}/delete`, this.deleteSubscription);
    }

    private readonly getFilteredSubscriptions = async (
        req: Request<
            {},
            {},
            {
                business: string;
                filters: {
                    createdAt: { from: Date; to: Date };
                    age: { from: Date; to: Date };
                    city: string;
                };
            }
        >,
        res: Response
    ) => {
        const { filters: _filters, business } = req.body;
        const filters = _filters
            ? filterToQuery(getTruthyFilters(_filters))
            : {};

        return Subscription.find({ business })
            .where({ createdAt: filters.createdAt })
            .populate('business', ['imageUrl', 'name'])
            .populate({
                path: 'user',
                match: {
                    'info.city': filters.city,
                    'info.birthDate': filters.birthDate
                }
            })
            .exec()
            .then((subscriptions) => this.enrichWithActivity(subscriptions))
            .then((subscriptions) => {
                if (!subscriptions) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res
                    .status(StatusCodes.OK)
                    .json(subscriptions.filter(({ user }) => !!user));
            })
            .catch((err) =>
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
            );
    };

    private readonly getSubscriptions = async (
        req: Request<
            {},
            {},
            {},
            { user: string; business: string; id: string }
        >,
        res: Response
    ) => {
        const filters = getTruthyFilters(req.query);

        return Subscription.find(filters)
            .populate('business', ['imageUrl', 'name'])
            .populate('user', ['imageUrl', 'name'])
            .exec()
            .then((subscriptions) => {
                if (!subscriptions) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res.status(StatusCodes.OK).json(subscriptions);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly createSubscription = async (
        req: Request<{}, {}, { user: IUser; business: IBusiness }>,
        res: Response
    ) => {
        const { user, business } = req.body;

        return new Subscription({
            user: user.id,
            business: business.id,
            createdAt: new Date()
        })
            .save()
            .then(({ id }) => res.status(StatusCodes.OK).json({ id }))
            .catch((err) => {
                console.log(err);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json();
            });
    };

    private readonly deleteSubscription = async (
        req: Request<{}, {}, { id: string }>,
        res: Response
    ) => {
        const { id } = req.body;

        return Subscription.findByIdAndDelete(id)
            .then((doc) => {
                if (!doc) {
                    return res.status(StatusCodes.NOT_FOUND);
                }
                return res.status(StatusCodes.OK).json({ id });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly enrichWithActivity = async (
        subscriptions: ISubscription[]
    ) => {
        return Promise.all(
            subscriptions.map(async (subscription) => {
                const { user, business } = subscription;

                const userId = (user as IUser).id;
                const businessId = (business as IBusiness).id;

                const coupons = await Coupon.find({ user: userId })
                    .populate('discount')
                    .then((_) => {
                        return _.filter(
                            (coupon) =>
                                businessId ==
                                (coupon.discount as IDiscount).business
                        );
                    });

                return {
                    user: subscription.user,
                    business: subscription.business,
                    createdAt: subscription.createdAt,
                    activity: {
                        totalCoupons: coupons.length,
                        activeCoupons: coupons.filter(
                            (_) =>
                                (_.discount as IDiscount).expiredAt >=
                                new Date()
                        ).length,
                        redeemedCoupons: coupons.filter((_) => _.isRedeemed)
                            .length,
                        lastRedeemed: coupons.sort(
                            (a, b) =>
                                (a?.redeemedAt?.getTime() || 0) -
                                (b?.redeemedAt?.getTime() || 0)
                        )[0]?.redeemedAt
                    }
                };
            })
        );
    };
}
