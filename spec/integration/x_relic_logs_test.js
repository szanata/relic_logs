const chai = require('chai');
const chaiHttp = require('chai-http');
const mock = require('mock-require');
const nock = require('nock');
const fs = require('fs');
const path = require('path');
const outPath = path.join(__dirname, 'out');

const expect = chai.expect;
const assert = chai.assert;

process.env.NODE_ENV = 'test';

const app = require('./fake_app');

chai.use(chaiHttp);

describe('Integration > eXperimental Relic Logs full action', () => {

  it('Should log all parts of the request life cycle', async () => {

    const response = await chai.request(app)
      .get('/foo')
      .query({ name: 'audi' } );

    const output = fs.readFileSync( outPath, 'utf8' );

    assert( output.includes('Event 0') );
    assert( output.includes('Event 1') );
    assert( output.includes('Event 2') );
    assert( output.includes('Event 3') );
  });
});
