const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

const expect = chai.expect;
const assert = chai.assert;

// to stub
const LogBundle = require('../../lib/models/log_bundle');
const LogSender = require('../../lib/services/log_sender');

describe('eXperimental Request Life Cycle Logs tests', () => {

  let XRelicLogs;
  let knowSettings;

  afterEach( () => {
    if ( LogSender.send.restore ) {
      LogSender.send.restore();
    }
    if ( console.log.restore ) {
      console.log.restore();
    }
  })
  // get a new relic logs
  beforeEach( () => {
    // remove from cache
    const path = '../../x_relic_logs';
    delete require.cache[require.resolve(path)]

    // add new default settings
    knowSettings = {
      title: 'Bar',
      envs: ['staging'],
      outputs: [{
        type: 'log',
        serializer: 'console',
        sender: 'fake_sender'
      }]
    };

    mock('../../lib/utils/defaults', knowSettings );
    XRelicLogs = require(path);
    mock.stop('../../lib/utils/defaults');
  });

  it('Should create a middleware and listen, create a the identifiable stacktrace entry and listen req.end', () => {
    const middleware = XRelicLogs.layup();
    const sendStub = sinon.stub( LogSender, 'send' ).returns( true );
    const loggersSym = Object.getOwnPropertySymbols( XRelicLogs )[0];

    let mockReqOnCalled = false;
    let receivedEndFn = null;
    const mockReqOn = (event, fn) => {
      expect( event ).to.eql( 'end' );
      expect( fn ).to.be.a.function;
      mockReqOnCalled = true;
      receivedEndFn = fn;
    }
    const mockReq = { on: mockReqOn };
    const mockRes = { };
    let nextCalled = false;
    const mockNext = () => nextCalled = true;

    expect( XRelicLogs[loggersSym].length ).to.eql( 0 );
    expect( middleware ).to.be.a.function;
    middleware( mockReq, mockRes, mockNext );

    expect( XRelicLogs[loggersSym].length ).to.eql( 1 );
    assert( nextCalled );
    assert( mockReqOnCalled );

    receivedEndFn();
    assert( sendStub.calledOnce );
    expect( XRelicLogs[loggersSym].length ).to.eql( 0 );
    expect( sendStub.getCall(0).args[0] ).to.deep.eql( knowSettings );
    expect( sendStub.getCall(0).args[1].constructor.name ).to.eql( 'LogBundle' );
  });

  it('Should intercept error', () => {
    const handler = XRelicLogs.interceptError();

    const logStub = sinon.stub( console, 'log' ).returns( true );
    const mockErr = new Error('Foo');
    let nextCalled = false;
    const mockNext = () => nextCalled = true;

    expect( handler ).to.be.a.function;

    handler( mockErr, { }, { }, mockNext );

    assert( logStub.calledOnce );
    expect( logStub.getCall(0).args[1] ).to.eql( 'Fatal error on request' )
    expect( logStub.getCall(0).args[2] ).to.deep.eql( mockErr );
  });
});
