import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IBusiness } from 'models/Business.model';
import { Business } from '../models';

export class BusinessController implements IController {
    path: string = '/business';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}/businesses`, this.getBusinesses);
        this.router.post(`${this.path}`, this.createBusiness);
        this.router.get(`${this.path}`, this.getBusiness);
    }

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

    private readonly getBusiness = async (
        req: Request<{}, {}, {}, { businessId: string }>,
        res: Response
    ) => {
        const { businessId } = req.query;

        return Business.findById(businessId)
            .then((businesses) => res.status(StatusCodes.OK).json(businesses))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };

    private readonly createBusiness = async (
        req: Request<{}, {}, IBusiness, {}>,
        res: Response
    ) => {
        const { imageUrl, name } = req.body;

        return new Business({ imageUrl, name })
            .save()
            .then((business) => res.status(StatusCodes.OK).json(business))
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };
}