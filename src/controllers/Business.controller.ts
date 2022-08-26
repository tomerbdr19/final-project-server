import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Business, IBusiness } from '@models';
import { IController, ServerErrors } from '@types';

export class BusinessController implements IController {
    path: string = '/business';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}/businesses`, this.getBusinesses);
        this.router.post(`${this.path}`, this.updateBusiness);
        this.router.post(`${this.path}/theme`, this.updateBusinessTheme);
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
}
