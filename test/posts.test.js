require('dotenv/config');
const request = require('supertest');
const express = require('express');
const app = express();
const postsRoute = require('../routes/posts');
const { chai } = require('./testConfig');

app.use(express.urlencoded({ extended: false }));
app.use('/posts', postsRoute);

describe('/posts route', () => {
  it('GET returns array', () => {
    return request(app)
      .get('/posts')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        console.log('res: ', res.body);
        chai.expect(res.body).to.be.an('array');
      });
  });
});
