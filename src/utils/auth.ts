import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import passport from '../passport/passport';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

export const hashPassword = async (password: string): Promise<string> =>
    await bcrypt.hash(password, 10);

export const generateJwt = (userId: string) => {
    const payload = {
        userId
    };
    const expiresIn = '90d';

    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn });
};

export const jwtAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return passport.authenticate(
        'jwt',
        { session: false },
        (error, jwtToken) => {
            if (error || !jwtToken) {
                return res.status(error.status).json({ error });
            }

            return res.status(StatusCodes.OK).json({ token: jwtToken });
        }
    )(req, res, next);
};
