const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const router = express.Router();
const debug = require('debug')('auth');

// MODELS
const User = require('../models/user');

// custom extractor for jwt token from cookie
const cookieExtractor = (req) => {
  if (!req || !req.signedCookies) {
    return null;
  }

  return req.signedCookies['jwt'];
};

// PASSPORT LOCAL STRATEGY
passport.use(
  new LocalStrategy((username, password, done) => {
    debug(`PASPORT local strategy > username: ${username}`);
    debug(`PASPORT local strategy > password: ${password}`);
    User.findOne({ username }).then((user) => {
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password.',
        });
      }

      return user
        .validatePassword(password)
        .then((passwordValid) => {
          debug(`PASSPORT local strategy > password valid: ${passwordValid}`);
          if (!passwordValid) {
            return done(null, false, {
              message: 'Incorrect username or password.',
            });
          }

          return done(null, user);
        })
        .catch((error) => {
          return done(null, false, {
            message: `Validation error: ${error.message}`,
          });
        });
    });
  })
);

// PASSPORT JWT STRATEGY
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwt_payload, done) => {
      const userId = jwt_payload.id;

      User.findOne({ _id: userId })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              error: {
                message: 'Incorrect username or password.',
              },
            });
          }

          return done(null, {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          });
        })
        .catch((err) => done(err, false));
    }
  )
);

/* POST auth login. */
router.post('/login', [
  check('username').exists().notEmpty().isString().trim().escape(),
  check('password').exists().notEmpty().isString().trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) });
    }

    const { username, password } = req.body;

    User.findOne({ username }).then((user) => {
      debug(`LOGIN > user found in db: ${user}`);
      if (!user) {
        return res
          .status(400)
          .json({ error: { message: 'Incorrect username or password' } });
      }

      return user
        .validatePassword(password)
        .then((passwordValid) => {
          debug(`LOGIN > password valid: ${passwordValid}`);
          if (!passwordValid) {
            return res
              .status(400)
              .json({ error: { message: 'Incorrect username or password' } });
          }

          // Generate jwt token for user and return it in response
          const token = jwt.sign(
            {
              id: user._id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
          );

          if (!token) {
            debug(`/login > Token is undefined`);
            return res
              .status(404)
              .json({ error: 'Auth error! Unable to generate token' });
          }

          return res
            .cookie('jwt', token, {
              httpOnly: true, // to disable accessing cookie via client side js
              secure: true, // to force https
              maxAge: 43200000, // 12h ttl in ms (remove this option and cookie will die when browser is closed)
              signed: true, // if you use the secret with cookieParser
            })
            .status(201)
            .json({
              id: user._id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            });
        })
        .catch((error) => {
          return res.status(400).json({
            error: {
              message: `Validation error: ${error.message}`,
            },
          });
        });
    });

    // next();
  },
  // (req, res) =>
  //   passport.authenticate('local', { session: false }, (error, user) => {
  //     debug(`/login | passport.auth > local | user: ${user}`);
  //     if (error) {
  //       debug(`/login | passport.auth > local | error: ${error.message}`);
  //       return res.status(404).json({ error });
  //     }
  //     if (!user) {
  //       return res
  //         .status(400)
  //         .json({ error: { message: 'Incorrect username or password' } });
  //     }

  //     req.login(user, { session: false }, (error) => {
  //       if (error) {
  //         debug(
  //           `/login | passport.auth > local > req.login | error: ${error.message}`
  //         );
  //         return res.status(404).json({ error });
  //       }

  //       // Generate jwt token for user and return it in response
  //       const token = jwt.sign(
  //         {
  //           id: user._id,
  //           username: user.username,
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           role: user.role,
  //         },
  //         process.env.JWT_SECRET,
  //         { expiresIn: '12h' }
  //       );

  //       if (!token) {
  //         debug(`/login | passport.auth > local > Token is undefined`);
  //         return res
  //           .status(404)
  //           .json({ error: 'Auth error! Unable to generate token' });
  //       }

  //       return res
  //         .cookie('jwt', token, {
  //           httpOnly: true, // to disable accessing cookie via client side js
  //           secure: true, // to force https
  //           maxAge: 43200000, // 12h ttl in ms (remove this option and cookie will die when browser is closed)
  //           signed: true, // if you use the secret with cookieParser
  //         })
  //         .status(200)
  //         .json({
  //           id: user._id,
  //           username: user.username,
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           role: user.role,
  //         });
  //     });
  //   })(req, res),
]);

// authorize with jwt cookie if exist
router.post('/', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, function (error, user) {
    if (error) {
      return res.status(404).json(error);
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: { status: 401, message: 'Not authorized' } });
    }
    return res.status(200).json(user);
  })(req, res, next);
});

// logout user by removing existing jwt cookie
// TODO: invalidate jwt token (token blacklist stored in redis)
router.post('/logout', (req, res) => {
  return res.clearCookie('jwt').status(200).json({ ok: true });
});

module.exports = router;
