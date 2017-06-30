const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const assert = chai.assert;

// dependencies to stub
const timestamp = require('../../../lib/utils/timestamp');
const tracer = require('../../../lib/utils/tracer');

const MessageSigner = require('../../../lib/services/message_signer');

let tracerStub;
let timestampStub;

const knowTime = 'time_info';
const knowTracerInfo = 'tracer_info';
const knowStringifiedData = [ 'string 1', 'string 2' ];

describe('Services > Message Signer test', () => {

  beforeEach( () => {
    tracerStub = sinon.stub( tracer, 'lineInfo').returns( knowTracerInfo );
    timestampStub = sinon.stub( timestamp, 'now').returns( knowTime );
  });

  afterEach( () => {
    tracerStub = tracer.lineInfo.restore();
    timestampStub = timestamp.now.restore();
  });

  it('Should append metadata to the result', () => {
    const messages = [ 'foo', 'bar', { foo: 'bar' } ];
    const result = MessageSigner.run( ...messages );

    expect( result ).to.be.array;
    assert( tracerStub.calledOnce );
    assert( timestampStub.calledOnce );
    expect( result ).to.deep.eql( [ knowTime, knowTracerInfo ] );
  });
});
