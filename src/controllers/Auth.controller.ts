import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Auth } from '../models';

export class AuthController implements IController {
  path: string = '/auth';
  router: Router = Router();

  constructor () {
    this.initRoutes();
  }

  private initRoutes () {
    this.router.post(`${this.path}/login`, this.login);
    this.router.post(`${this.path}/update-password`, this.updatePassword);
    this.router.post(`${this.path}/set-credentials`, this.setCredentials);
  }

  private readonly login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    return await Auth.findOne({ email }).exec().then((auth) =>
      auth
        ? auth.isCorrectPassword(password)
          ? res.status(StatusCodes.OK).json({ id: auth._id })
          : res.status(StatusCodes.BAD_REQUEST).json({ error: 'invalid credentials' })
        : res.status(StatusCodes.NOT_FOUND).json({ error: 'email not exists' }))
      .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR));
  };

  private readonly updatePassword = async (req: Request, res: Response) => {
    const { id, password } = req.body;

    return (await Auth.findOneAndUpdate({ _id: id }, { password }).exec())
      ? res.status(StatusCodes.OK)
      : res.status(StatusCodes.NOT_FOUND);
  };

  private readonly setCredentials = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    return await new Auth({ email, password })
      .save()
      .then((user) =>
        user
          ? res.status(StatusCodes.OK).json({ id: user._id })
          : res.status(StatusCodes.BAD_REQUEST)
      );
  };
}
