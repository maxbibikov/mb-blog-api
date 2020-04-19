const mongoose = require('mongoose');
const debug = require('debug')('config');

// DB CONNECTION
const dbUrl = process.env.DB_URL || process.env.DB_URL_DEV;

if (!dbUrl) {
  throw Error(
    'Database url undefined. Set DB_URL and/or DB_URL_DEV env variables'
  );
}

const mongooseOptions = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

mongoose.connect(dbUrl, mongooseOptions);

const db = mongoose.connection;

db.on('error', (err) => {
  if (err.message.code === 'ETIMEDOUT') {
    debug(err);
    mongoose.connect(dbUrl, mongooseOptions);
  }
  debug(err);
});

db.once('open', () => {
  debug('MongoDB successfully connected');
});
