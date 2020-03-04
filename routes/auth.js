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
  console.log(' req.cookies: ', req.signedCookies['jwt']);
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
      console.log('jwt_payload: ', jwt_payload);
      const userId = jwt_payload.id;

      User.findOne({ _id: userId })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: 'Incorrect username or password.',
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
      return res.json({ errors: errors.array() });
    }
    next();
  },
  (req, res, next) =>
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(400).json({ message: 'Incorrect username or password' });
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

        res.cookie('jwt', token, {
          httpOnly: true, // to disable accessing cookie via client side js
          //secure: true, // to force https (if you use it)
          maxAge: 86400000, // ttl in ms (remove this option and cookie will die when browser is closed)
          signed: true, // if you use the secret with cookieParser
        });
        return res.sendStatus(200);
      });
    })(req, res),
]);

module.exports = router;
