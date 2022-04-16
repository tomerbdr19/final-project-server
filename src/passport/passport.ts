import bcrypt from 'bcrypt';
import { Auth } from '../models';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import { ServerErrors } from '../types/ServerErrors';
import { generateJwt } from '../utils/auth';

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    Auth.findOne({ email })
      .then((auth) => {
        if (!auth) {
          return done(ServerErrors.INVALID_EMAIL, false);
        } else {
          bcrypt.compare(password, auth.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              const token = `bearer ${generateJwt(auth)}`;
              return done(null, token);
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
      Auth.findOne({ userId: jwtPayload.userId })
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