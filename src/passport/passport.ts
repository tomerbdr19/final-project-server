import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { ServerErrors } from '@types';
import { generateJwt } from '@utils/auth';
import { Auth, IBusiness, IUser } from '@models';

passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        Auth.findOne({ email })
            .populate('user')
            .populate('business')
            .exec()
            .then((auth) => {
                if (!auth) {
                    return done(ServerErrors.INVALID_EMAIL, false);
                } else {
                    bcrypt.compare(password, auth.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            const userId = (auth.user as IUser)?.id;
                            const businessId = (auth.business as IBusiness)?.id;
                            const token = `bearer ${generateJwt(
                                userId || businessId
                            )}`;
                            const user = auth.user;
                            const business = auth.business;
                            return done(null, { token, user, business });
                        } else {
                            return done(ServerErrors.INVALID_PASSWORD, false);
                        }
                    });
                }
            })
            .catch(() => {
                return done(ServerErrors.INTERNAL_ERROR, false);
            });
    })
);

passport.use(
    new JwtStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        (jwtPayload, done) => {
            Auth.findOne({ user: jwtPayload.userId })
                .then((auth) => {
                    if (!auth) {
                        return done(ServerErrors.UNAUTHORIZED, false);
                    } else {
                        return done(null, jwtPayload);
                    }
                })
                .catch(() => {
                    return done(ServerErrors.INTERNAL_ERROR, false);
                });
        }
    )
);

export default passport;
