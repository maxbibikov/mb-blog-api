const request = require('supertest');
const express = require('express');
const app = express();
const index = require('../routes/index');
const { chai } = require('./testConfig');

app.use(express.urlencoded({ extended: false }));
app.use('/', index);

describe('index route', () => {
  it('works and redirects to /posts', () => {
    return request(app)
      .get('/')
      .expect(302)
      .then((response) => {
        chai.expect(response.headers.location).to.equal('/posts');
      });
  });
});
