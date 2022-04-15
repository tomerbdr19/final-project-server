import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../models';

export class UserController implements IController {
  path: string = '/user';
  router: Router = Router();

  constructor () {
    this.initRoutes();
  }

  private initRoutes () {
    this.router.get(`${this.path}/user`, this.getUserInfo);
  }

  private readonly getUserInfo = async (req: Request, res: Response) => {
    const { id } = req.params;

    return await User.findOne({ _id: id })
      .exec()
      .then((user) =>
        user
          ? res.status(StatusCodes.OK).json(user.info)
          : res.status(StatusCodes.NOT_FOUND)
      );
  };
}
