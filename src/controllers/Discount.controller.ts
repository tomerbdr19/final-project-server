/* eslint-disable @typescript-eslint/indent */
import { IController } from '@types';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Coupon, Discount, Post, Subscription } from '@models';
import { ObjectId, Types } from 'mongoose';

export class DiscountController implements IController {
    path: string = '/discount';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getDiscounts);
        this.router.post(`${this.path}`, this.createDiscount);
        this.router.post(`${this.path}/delete`, this.deleteDiscount);
        this.router.post(`${this.path}/extend`, this.extendDiscount);
        this.router.post(`${this.path}/share`, this.shareDiscount);
    }

    private readonly getDiscounts = async (
        req: Request<{}, {}, {}, { business: string }>,
        res: Response
    ) => {
        const { business } = req.query;

        return Discount.find({ business })
            .populate('business')
            .then(async (discounts) => {
                if (!discounts) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const enrichedDiscounts = await Promise.all(
                    discounts.map(async (discount) => ({
                        ...(discount as any)._doc,
                        statistics: await this.getDiscountsStatistics(
                            discount.id
                        ),
                        id: discount.id
                    }))
                );

                return res.status(StatusCodes.OK).json(enrichedDiscounts);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private getDiscountsStatistics = async (discount: string) => {
        const agg = await Coupon.aggregate()
            .match({ discount: new Types.ObjectId(discount) })
            .group({ _id: { isRedeemed: '$isRedeemed' }, count: { $sum: 1 } });

        const res: {
            redeemed: number;
            available: number;
            total: number;
            percentage: number;
        } = {
            redeemed: 0,
            available: 0,
            total: 0,
            percentage: 0
        };

        agg.forEach(({ _id: { isRedeemed }, count }) => {
            isRedeemed ? (res.redeemed = count) : (res.available = count);
        });

        res.total = res.redeemed + res.available;
        res.percentage = (res.redeemed / res.total) * 100 || 0;

        return res;
    };

    private readonly createDiscount = async (
        req: Request<
            {},
            {},
            {
                business: string;
                description: string;
                imageUrl: string;
                expiredAt: string;
                sendToAllSubscribers: boolean;
                isPublic: boolean;
                limit: number;
            }
        >,
        res: Response
    ) => {
        const {
            business,
            description,
            imageUrl,
            expiredAt,
            limit,
            sendToAllSubscribers,
            isPublic
        } = req.body;

        const discount = new Discount({
            business,
            description,
            imageUrl,
            limit,
            expiredAt,
            isPublic
        });

        const post = isPublic
            ? new Post({
                  business,
                  caption: description,
                  imageUrl,
                  discount: discount.id
              })
            : null;

        return discount
            .save()
            .then(async (discount) => {
                post && post.save();

                if (sendToAllSubscribers) {
                    const subscribers = await Subscription.aggregate<{
                        user: ObjectId;
                    }>()
                        .match({ business: new Types.ObjectId(business) })
                        .project({ user: 1 });

                    await Promise.all(
                        subscribers.map(({ user }) =>
                            new Coupon({
                                user,
                                business,
                                discount: discount.id
                            }).save()
                        )
                    );
                }

                return discount;
            })
            .then((discount) => res.status(StatusCodes.OK).json(discount))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly deleteDiscount = async (
        req: Request<
            {},
            {},
            {
                business: string;
                discount: string;
            }
        >,
        res: Response
    ) => {
        const { business, discount } = req.body;

        return Discount.findOneAndDelete({
            business: new Types.ObjectId(business),
            _id: new Types.ObjectId(discount)
        })
            .populate('business')
            .then(async (discount) => {
                if (!discount) {
                    return res.status(StatusCodes.NOT_FOUND).json();
                }

                const { id, isPublic } = discount;

                if (isPublic) {
                    await Post.deleteMany({
                        discount: id
                    }).exec();
                }

                await Coupon.deleteMany({
                    discount: id,
                    redeemedAt: { $eq: null }
                });

                return discount;
            })
            .then((discount) => res.status(StatusCodes.OK).json(discount))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly extendDiscount = async (
        req: Request<
            {},
            {},
            {
                business: string;
                discount: string;
                expiredAt: Date;
            }
        >,
        res: Response
    ) => {
        const { business, discount, expiredAt } = req.body;

        return Discount.findOneAndUpdate(
            {
                _id: new Types.ObjectId(discount),
                business: new Types.ObjectId(business)
            },
            { expiredAt },
            { new: true }
        )
            .populate('business')
            .then((discount) => {
                return res.status(StatusCodes.OK).json(discount);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };

    private readonly shareDiscount = async (
        req: Request<
            {},
            {},
            {
                business: string;
                discount: string;
            }
        >,
        res: Response
    ) => {
        const { business, discount } = req.body;

        return Discount.findOneAndUpdate(
            {
                business: new Types.ObjectId(business),
                _id: new Types.ObjectId(discount)
            },
            { isPublic: true },
            { new: true }
        )
            .populate('business')
            .then(async (discount) => {
                if (!discount) {
                    throw '';
                }
                await new Post({
                    business,
                    caption: discount.description,
                    imageUrl: discount.imageUrl,
                    discount: discount.id
                }).save();
                res.status(StatusCodes.OK).json(discount);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
    };
}
