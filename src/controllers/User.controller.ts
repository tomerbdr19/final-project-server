import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models';

export class UserController implements IController {
    path: string = '/user';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get(`${this.path}`, this.getUser);
    }

    private readonly getUser = async (req: Request, res: Response) => {
        const { userId } = req.query;

        return User.findById(userId)
            .then((user) =>
                user
                    ? res.status(StatusCodes.OK).json(user)
                    : res.status(StatusCodes.NOT_FOUND)
            )
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
    };
}
