require('./mongoTestConfig');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
module.exports = { chai };
