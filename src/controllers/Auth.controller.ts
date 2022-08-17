import { IController } from '@types';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { generateJwt, hashPassword, jwtAuth } from '@utils/auth';
import { Auth, Business, User } from '@models';

export class AuthController implements IController {
    path: string = '/auth';
    router: Router = Router();

    constructor() {
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(`${this.path}/login`, this.login);
        this.router.post(`${this.path}/register`, this.register);
        this.router.post(
            `${this.path}/update-password`,
            jwtAuth,
            this.updatePassword
        );
        this.router.post(
            `${this.path}/set-credentials`,
            jwtAuth,
            this.setCredentials
        );
    }

    private readonly login = async (req: Request, res: Response) => {
        passport.authenticate(
            'local',
            function (error, { token, user, business }) {
                if (error || !token) {
                    console.log(error);
                    return res.status(error.status).json({ error });
                }
                return res
                    .status(StatusCodes.OK)
                    .json({ token, user, business });
            }
        )(req, res);
    };

    private readonly register = async (req: Request, res: Response) => {
        const { email, password, type } = req.body;

        const userOrBusiness =
            type === 'business'
                ? { business: new Business() }
                : { user: new User() };

        const hashedPassword = await hashPassword(password);

        return await new Auth({
            email,
            password: hashedPassword,
            ...userOrBusiness
        })
            .save()
            .then(async (auth) => {
                const { user, business } = auth;

                const userOrBusinessId = user || business;
                await userOrBusiness.business?.save();
                await userOrBusiness.user?.save();

                return res.status(StatusCodes.OK).json({
                    token: generateJwt(userOrBusinessId.toString()),
                    user,
                    business
                });
            })
            .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json());
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
