const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

const expect = chai.expect;
const assert = chai.assert;

// to stub
const LogBundle = require('../../lib/models/log_bundle');
const LogSender = require('../../lib/services/log_sender');

describe('Request Life Cycle Logs tests', () => {

  let RelicLogs;
  let knowSettings;

  afterEach( () => {
    if ( LogSender.send.restore ) {
      LogSender.send.restore();
    }
  })
  // get a new relic logs
  beforeEach( () => {
    // remove from cache
    const path = '../../relic_logs';
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
    RelicLogs = require(path);
    mock.stop('../../lib/utils/defaults');
  });

  it('Should init the Relic Logs with given config', () => {
    const knowOptions = {
      title: 'Foo',
      envs: ['development'],
      outputs: [ {
        type: 'any',
        serializer: 'string',
        sender: 'bar'
      }]
    }
    RelicLogs.init( knowOptions );

    expect( knowSettings.title ).to.eql( knowOptions.title );
    expect( knowSettings.envs ).to.deep.eql( knowOptions.envs );
    expect( knowSettings.outputs ).to.deep.eql( knowOptions.outputs );
  });

  it('Should create the req.end interceptor and send logs', () => {
    const initFn = RelicLogs.init( { envs: [ process.env.NODE_ENV ] } );

    expect( initFn ).to.be.a.function;

    const mockRlc = { foo: 'bar' };
    const sendLogsStub = sinon.stub(LogSender, 'send').returns( true );
    let reqOnEndSet = false;
    const fakeReqOn = ( event, fn ) => {
      expect( event ).to.eql( 'end' );
      expect( fn ).to.be.a.fn;
      reqOnEndSet = true;
      fn();
      assert( sendLogsStub.calledOnce );
      assert( sendLogsStub.calledWith( knowSettings, mockRlc ) );
    }
    const fakeReq = { on: fakeReqOn };
    const fakeRes = { locals: { rlc: mockRlc } };
    let nextCalled = false;
    const next = () => nextCalled = true;

    initFn( fakeReq, fakeRes, next );

    assert( nextCalled );
    assert( reqOnEndSet );
  });

  it('Should create the req.end interceptor but not send logs if the env is not allowed by config', () => {
    const initFn = RelicLogs.init( { envs: [ 'some_random_env' ] } );

    expect( initFn ).to.be.a.function;

    const mockRlc = { foo: 'bar' };
    const sendLogsStub = sinon.stub(LogSender, 'send').returns( true );
    let reqOnEndSet = false;
    const fakeReqOn = ( event, fn ) => {
      expect( event ).to.eql( 'end' );
      expect( fn ).to.be.a.fn;
      reqOnEndSet = true;
      fn();
      assert( sendLogsStub.notCalled );
    }
    const fakeReq = { on: fakeReqOn };
    const fakeRes = { locals: { rlc: mockRlc } };
    let nextCalled = false;
    const next = () => nextCalled = true;

    initFn( fakeReq, fakeRes, next );

    assert( nextCalled );
    assert( reqOnEndSet );
  });

  it('Should intercept a route and inject a rlc object', () => {
    const intercept = RelicLogs.intercept( 'subheading' );

    expect( intercept ).to.be.a.function;

    const fakeReq = { };
    const fakeRes = { locals: { } };
    let nextCalled = false;
    const next = () => nextCalled = true;

    // invoke the intercep fn
    intercept( fakeReq, fakeRes, next );

    assert( nextCalled );

    const rlc = fakeRes.locals.rlc;

    expect( rlc.constructor.name ).to.eql( 'LogBundle' );
  });

  it('Should intercep the express error handler and append an error', () => {
    const errorHandler = RelicLogs.interceptError( );

    expect( errorHandler ).to.be.a.function;

    const knowError = new Error( 'Foo' );
    const fakeReq = { };

    let appendErrorCalled = false;
    const appendError = ( title, err ) => {
      assert( title === 'Fatal error on request')
      assert( err === knowError );
      appendErrorCalled = true;
    }
    const mockRlc = { appendError };
    const fakeRes = { locals: { rlc: mockRlc } };

    let nextCalledWithError = false;
    const next = (err) => nextCalledWithError = err === knowError;

    errorHandler( knowError, fakeReq, fakeRes, next );

    assert( appendErrorCalled );
    assert( nextCalledWithError );
  })
});
