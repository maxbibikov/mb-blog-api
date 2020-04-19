const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const debug = require('debug')('mongoTest');

const { populateDB } = require('./populateDB');
const mongoServer = new MongoMemoryServer();

mongoose.Promise = Promise;

before(() => {
  return mongoServer
    .getConnectionString()
    .then((mongoUri) => {
      const mongooseOpts = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      };

      mongoose.connect(mongoUri, mongooseOpts);
      mongoose.connection.on('error', (err) => {
        if (err.message.code === 'ETIMEDOUT') {
          console.error(err);
          mongoose.connect(mongoUri, mongooseOpts);
        }
        console.error(err);
      });

      mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected to ${mongoUri}`);
        return populateDB().catch((error) => debug(error));
      });
    })
    .catch((error) => {
      debug(error);
    });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
