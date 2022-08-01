import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUser } from 'models/User.model';
import { User } from '../models';
import { ServerErrors } from '../types/ServerErrors';

export class UserController implements IController {
    path: string = '/user';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getUser);
        this.router.post(`${this.path}`, this.updateUser);
    }

    private readonly getUser = async (req: Request, res: Response) => {
        const { userId } = req.query;

        return User.findById(userId)
            .then((user) =>
                user
                    ? res.status(StatusCodes.OK).json(user)
                    : res
                          .status(StatusCodes.NOT_FOUND)
                          .json(ServerErrors.INTERNAL_ERROR)
            )
            .catch(() =>
                res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json(ServerErrors.INTERNAL_ERROR)
            );
    };

    private readonly updateUser = async (
        req: Request<{}, {}, { user: IUser }>,
        res: Response
    ) => {
        const { user } = req.body;

        return User.findByIdAndUpdate(user.id, user, { new: true })
            .then((updatedUser) => {
                if (!updatedUser) {
                    return res
                        .status(StatusCodes.NOT_FOUND)
                        .json(ServerErrors.NOT_FOUND);
                }

                return res.status(StatusCodes.OK).json(updatedUser);
            })
            .catch(() =>
                res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json(ServerErrors.INTERNAL_ERROR)
            );
    };
}
