import { IController } from '@/types/Controller';
import { getTruthyFilters } from '../utils/filter';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Subscription } from '../models';

export class SubscribeController implements IController {
    path: string = '/subscribe';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getSubscriptions);
        this.router.post(`${this.path}`, this.createSubscription);
        this.router.delete(`${this.path}`, this.deleteSubscription);
    }

    private readonly getSubscriptions = async (
        req: Request<
            {},
            {},
            {},
            { userId: string; businessId: string; id: string }
        >,
        res: Response
    ) => {
        const filters = getTruthyFilters(req.query);

        return Subscription.find(filters)
            .then((subscriptions) => {
                if (!subscriptions) {
                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
                }

                return res.status(StatusCodes.OK).json({ subscriptions });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly createSubscription = async (
        req: Request<{}, {}, { userId: string; businessId: string }>,
        res: Response
    ) => {
        const { userId, businessId } = req.body;

        return new Subscription({ userId, businessId, createdAt: new Date() })
            .save()
            .then((subscription) =>
                res.status(StatusCodes.OK).json(subscription)
            )
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly deleteSubscription = async (
        req: Request<{}, {}, {}, { subscriptionId: string }>,
        res: Response
    ) => {
        const { subscriptionId } = req.query;

        return Subscription.findByIdAndDelete(subscriptionId)
            .then((doc) => {
                if (!doc) {
                    return res.status(StatusCodes.NOT_FOUND);
                }
                return res.status(StatusCodes.OK);
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };
}