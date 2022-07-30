import { IController } from '@/types/Controller';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { generateJwt, hashPassword, jwtAuth } from '../utils/auth';
import { Auth, User } from '../models';

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
        passport.authenticate('local', function (error, { token, user }) {
            if (error || !token) {
                console.log(error);
                return res.status(error.status).json({ error });
            }
            return res.status(StatusCodes.OK).json({ token, user });
        })(req, res);
    };

    private readonly register = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        console.log(email, password);
        if (email && password) {
            const hashedPassword = await hashPassword(password);

            return await new User({})
                .save()
                .then(async (user) => await user.save())
                .then(async (user) => {
                    console.log(user);
                    return await new Auth({
                        user: user._id,
                        email,
                        password: hashedPassword
                    }).save();
                })
                .then((auth) => {
                    console.log(auth);
                    return res
                        .status(StatusCodes.OK)
                        .json({ token: generateJwt(auth.id) });
                })
                .catch(() =>
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json()
                );
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({});
        }
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
