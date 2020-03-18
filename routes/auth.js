const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const router = express.Router();

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
    User.findOne({ username }).then((user) => {
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password.',
        });
      }

      return user.validatePassword(password).then((passwordValid) => {
        if (!passwordValid) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          });
        }

        return done(null, user);
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

          return done(null, { id: user._id });
        })
        .catch((err) => done(err, false));
    }
  )
);

/* POST auth login. */
router.post('/login', [
  check('username')
    .exists()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check('password')
    .exists()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) });
    }
    next();
  },
  (req, res, next) =>
    passport.authenticate('local', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(400)
          .json({ error: { message: 'Incorrect username or password' } });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return next(err);
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
          process.env.JWT_SECRET
        );

        return res
          .cookie('jwt', token, {
            httpOnly: true, // to disable accessing cookie via client side js
            secure: process.env.NODE_ENV === 'production', // to force https
            maxAge: 86400000, // ttl in ms (remove this option and cookie will die when browser is closed)
            signed: true, // if you use the secret with cookieParser
          })
          .status(201)
          .json({ user });
      });
    })(req, res),
]);

// authorize with jwt cookie if exist
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    return res.status(200).json({ success: true });
  }
);

module.exports = router;
