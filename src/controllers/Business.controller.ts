import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Business, IBusiness } from '@models';
import { IController } from '@types';

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
        this.router.get(`${this.path}/search`, this.searchBusinessesByName);
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
