require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
require('./mongoConfig');

// Production
const compression = require('compression');
const helmet = require('helmet');

// Routers
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');

const app = express();
const corsWhitelist = process.env.CORS_WHITELIST.split(' ');

app.use(helmet());
app.use(
  cors({
    origin: corsWhitelist,
    credentials: true,
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(passport.initialize());
// Compress all routes
app.use(compression());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

module.exports = app;
