import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    Business,
    IBusiness,
    BusinessView,
    Subscription,
    Coupon
} from '@models';
import { IController, ServerErrors } from '@types';
import moment from 'moment';
import { getAverageFromDate } from '@utils/aggregate';

export class BusinessController implements IController {
    path: string = '/business';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}/businesses`, this.getBusinesses);
        this.router.post(`${this.path}/log-view`, this.logBusinessView);
        this.router.get(`${this.path}/views`, this.getViews);
        this.router.get(`${this.path}/statistics`, this.getStatistics);
        this.router.post(`${this.path}/add-image`, this.addBusinessImage);
        this.router.post(`${this.path}/delete-image`, this.deleteBusinessImage);
        this.router.post(`${this.path}`, this.updateBusiness);
        this.router.post(`${this.path}/theme`, this.updateBusinessTheme);
        this.router.get(`${this.path}`, this.getBusiness);
        this.router.get(`${this.path}/search`, this.searchBusinessesByName);
    }

    private readonly logBusinessView = async (
        req: Request<{}, {}, { business: string; user: string }>,
        res: Response
    ) => {
        const { business, user } = req.body;

        return new BusinessView({
            business,
            user,
            createdAt: moment(new Date()).startOf('day').toDate()
        })
            .save()
            .then(() => res.status(StatusCodes.OK).json())
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly getViews = async (
        req: Request<
            {},
            {},
            {},
            { business: string; period: 'day' | 'week' | 'month' }
        >,
        res: Response
    ) => {
        const { business, period } = req.query;

        return BusinessView.find({
            business,
            createdAt: { $gte: moment(new Date()).startOf(period).toDate() }
        })
            .countDocuments()
            .then((_) => res.status(StatusCodes.OK).json(_));
    };

    private readonly getStatistics = async (
        req: Request<
            {},
            {},
            {},
            {
                business: string;
                period: 'day' | 'week' | 'month';
                fromDate: string;
            }
        >,
        res: Response
    ) => {
        const { business, period, fromDate: _fromDate } = req.query;

        const fromDate = new Date(JSON.parse(_fromDate));

        const viewsPromise = getAverageFromDate(
            BusinessView,
            period,
            business,
            fromDate
        );
        const subscribersPromise = getAverageFromDate(
            Subscription,
            period,
            business,
            fromDate
        );
        const couponsPromise = getAverageFromDate(
            Coupon,
            period,
            business,
            fromDate,
            'redeemedAt'
        );

        return await Promise.all([
            viewsPromise,
            subscribersPromise,
            couponsPromise
        ])
            .then(([views, subscriptions, coupons]) => {
                return res
                    .status(StatusCodes.OK)
                    .json({ views, subscriptions, coupons });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly getBusinesses = async (
        req: Request<{}, {}, { businessesIds: string[] }>,
        res: Response
    ) => {
        const { businessesIds } = req.body;

        return Promise.all(
            businessesIds.map((id) =>
                Business.findById(id).catch(() => undefined)
            )
        ).then((businesses) => res.status(StatusCodes.OK).json(businesses));
    };

    private readonly searchBusinessesByName = async (
        req: Request<{}, {}, {}, { name: string }>,
        res: Response
    ) => {
        const { name } = req.query;

        return Business.find({ name: { $regex: name, $options: 'i' } })
            .select(['name', 'id', 'imageUrl'])
            .limit(6)
            .exec()
            .then((businesses) => res.status(StatusCodes.OK).json(businesses));
    };

    private readonly getBusiness = async (
        req: Request<{}, {}, {}, { businessId: string }>,
        res: Response
    ) => {
        const { businessId } = req.query;

        return Business.findById(businessId)
            .then((businesses) => res.status(StatusCodes.OK).json(businesses))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly updateBusiness = async (
        req: Request<{}, {}, { business: IBusiness }, {}>,
        res: Response
    ) => {
        const { business } = req.body;

        return Business.findOneAndUpdate(business.id, business, { new: true })
            .then((updatedBusiness) => {
                if (!updatedBusiness) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                return res.status(StatusCodes.OK).json(updatedBusiness);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly updateBusinessTheme = async (
        req: Request<{}, {}, { business: string; key: string }, {}>,
        res: Response
    ) => {
        const { business, key } = req.body;

        return Business.findByIdAndUpdate(
            business,
            { theme: { key } },
            { new: true }
        )
            .then((updatedBusiness) => {
                if (!updatedBusiness) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                return res.status(StatusCodes.OK).json(updatedBusiness);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly addBusinessImage = async (
        req: Request<{}, {}, { business: string; imageUrl: string }, {}>,
        res: Response
    ) => {
        const { business, imageUrl } = req.body;

        return Business.findByIdAndUpdate(
            business,
            { $push: { images: imageUrl } },
            { new: true }
        )
            .then((updatedBusiness) => {
                if (!updatedBusiness) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                return res.status(StatusCodes.OK).json(updatedBusiness);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly deleteBusinessImage = async (
        req: Request<{}, {}, { business: string; imageUrl: string }, {}>,
        res: Response
    ) => {
        const { business, imageUrl } = req.body;
        return Business.findByIdAndUpdate(
            business,
            { $pull: { images: imageUrl } },
            { new: true }
        )
            .then((updatedBusiness) => {
                if (!updatedBusiness) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                return res.status(StatusCodes.OK).json(updatedBusiness);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };
}
