require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

// Production
const compression = require('compression');
const helmet = require('helmet');

// Routers
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');

// DB CONNECTION
const dbUrl = process.env.DB_URL || process.env.DB_URL_DEV;

if (!dbUrl) {
  throw Error(
    'Database url undefined. Set DB_URL and DB_URL_DEV env variables'
  );
}

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

const app = express();
console.log('TEST CORS WHITELIST: ', process.env.CORS_WHITELIST);
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
