import { IController } from '@types';
import { getTruthyFilters } from '@utils/filter';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IBusiness, IUser, Subscription } from '@models';

export class SubscribeController implements IController {
    path: string = '/subscribe';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getSubscriptions);
        this.router.post(`${this.path}`, this.createSubscription);
        this.router.post(`${this.path}/delete`, this.deleteSubscription);
    }

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
}
