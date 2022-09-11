import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    Business,
    IBusiness,
    BusinessView,
    Subscription,
    Coupon,
    Chat,
    Discount
} from '@models';
import { IController, ServerErrors } from '@types';
import moment from 'moment';
import { getAverageFromDate } from '@utils/aggregate';
import { Types } from 'mongoose';
import { Product } from '@models/Product.model';

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
        this.router.get(`${this.path}/activity`, this.getActivities);
        this.router.get(`${this.path}/products`, this.getProducts);
        this.router.post(`${this.path}/product`, this.addProduct);
        this.router.post(`${this.path}/delete-product`, this.deleteProduct);
        this.router.post(`${this.path}/product-price`, this.updateProductPrice);
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

    private readonly getProducts = async (
        req: Request<{}, {}, {}, { business: string }>,
        res: Response
    ) => {
        const { business } = req.query;

        return Product.find({
            business
        })
            .then((products) => res.status(200).json(products))
            .catch(() => res.status(500).json());
    };

    private readonly addProduct = async (
        req: Request<
            {},
            {},
            { business: string; name: string; imageUrl: string; price: string }
        >,
        res: Response
    ) => {
        const { business, name, imageUrl, price } = req.body;

        return new Product({ business, name, imageUrl, price })
            .save()
            .then((product) => res.status(200).json(product))
            .catch(() => res.status(500).json());
    };

    private readonly deleteProduct = async (
        req: Request<{}, {}, { business: string; product: string }>,
        res: Response
    ) => {
        const { business, product } = req.body;

        return Product.deleteOne({ business, _id: product })
            .then((product) => res.status(200).json(product))
            .catch(() => res.status(500).json());
    };

    private readonly updateProductPrice = async (
        req: Request<
            {},
            {},
            { product: string; business: string; price: string }
        >,
        res: Response
    ) => {
        const { price, business, product } = req.body;

        return Product.updateOne(
            { business, _id: product },
            { price },
            { new: true }
        )
            .then((product) => res.status(200).json(product))
            .catch(() => res.status(500).json());
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

    private readonly getActivities = async (
        req: Request<
            {},
            {},
            {},
            {
                business: string;
            }
        >,
        res: Response
    ) => {
        const { business } = req.query;

        const chatsPromise = Chat.aggregate<{
            _id: { label: string };
            value: number;
        }>([
            {
                $match: { business: new Types.ObjectId(business) }
            },
            {
                $group: {
                    _id: { label: '$status' },
                    value: { $sum: 1 }
                }
            }
        ]).then((_) => ({
            data: _.map(({ _id: { label }, value }) => ({ label, value }))
        }));

        const discountsPromise = Discount.aggregate([
            {
                $match: { business: new Types.ObjectId(business) }
            },
            {
                $group: {
                    _id: {
                        label: {
                            $cond: {
                                if: { $lt: ['$expiredAt', new Date()] },
                                then: 'expired',
                                else: 'active'
                            }
                        }
                    },
                    value: { $sum: 1 }
                }
            }
        ]).then((_) => ({
            data: _.map(({ _id: { label }, value }: any) => ({ label, value }))
        }));

        return await Promise.all([
            chatsPromise,
            discountsPromise,
            this.getDiscountsStatics(business)
        ])
            .then(([chats, discounts, discountsStatics]) => {
                return res.status(StatusCodes.OK).json({
                    chats,
                    discounts: { ...discounts, ...discountsStatics }
                });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly getDiscountsStatics = (business: string) => {
        return Coupon.aggregate<{
            _id: string;
            redeemed: number;
            discount: any;
            total: number;
        }>([
            {
                $match: { business: new Types.ObjectId(business) }
            },
            {
                $group: {
                    _id: '$discount',
                    redeemed: {
                        $sum: {
                            $cond: [{ $eq: ['$isRedeemed', true] }, 1, 0]
                        }
                    },
                    total: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: Discount.collection.name,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'discount'
                }
            },
            {
                $unwind: '$discount'
            },
            {
                $project: {
                    _id: 0,
                    'discount.business': 0
                }
            },
            {
                $sort: { redeemed: 1 }
            }
        ]).then((_) => ({ min: _[0], max: _[_.length - 1] }));
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
