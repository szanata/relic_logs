const chai = require('chai');
const sinon = require('sinon');
const mock = require('mock-require');

const expect = chai.expect;
const assert = chai.assert;

const knowKey = 'bar_7564-934'

class LoggerKlazz {
  constructor() {
    this.key = knowKey;
    this.logBundle = new LogBundleKlazz();
  }
  static get FatalSymbol() {
    return Symbol.for( 'fatal' );
  }
}

class LogBundleKlazz {
  append() { }
}

describe('eXperimental Request Life Cycle Logs tests', () => {

  let XRelicLogs;
  let knowSettings;

  let LogBundle;
  let StackUtils;
  let LoggerManager;
  let LogSender;
  let Logger;
  let oldProcess = process.env.NODE_ENV;

  // Call here to avoid conflic with other tasts tha clear cache
  before( () => {
    Logger = require('../../lib/models/logger');
    LogBundle = require('../../lib/models/log_bundle');
    StackUtils = require('../../lib/utils/stack_utils');
    LoggerManager = require('../../lib/services/logger_manager');
    LogSender = require('../../lib/services/log_sender');
  });

  afterEach( () => {
    if ( LogSender.send.restore ) { LogSender.send.restore(); }
    if ( LoggerManager.find.restore ) { LoggerManager.find.restore(); }
    if ( XRelicLogs.append.restore ) { XRelicLogs.append.restore(); }
    if ( StackUtils.extractEventKey.restore ) { StackUtils.extractEventKey.restore(); }
    process.env.NODE_ENV = oldProcess;
  });

  // get a new relic logs
  beforeEach( () => {
    // remove from cache
    const path = '../../x_relic_logs';
    delete require.cache[require.resolve(path)];

    process.env.NODE_ENV = 'staging';
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

    mock('../../lib/models/logger', LoggerKlazz );
    mock('../../lib/models/log_bundle', LogBundleKlazz );
    mock('../../lib/utils/defaults', knowSettings );
    XRelicLogs = require(path);
    mock.stop('../../lib/utils/defaults');
    mock.stop('../../lib/models/log_bundle');
    mock.stop('../../lib/models/logger');
  });

  it('Should append some logs', () => {
    let appendCalled = false;

    const knowArgs = [ 'foo','bar' ];
    const knowKey = 'foo_888-976';
    const knowLogger = {
      appendToBundle: function ( ..._args ) {
        appendCalled = true;
        expect( ..._args ).to.deep.eql( knowArgs );
      }
    };
    const extractEventKeyStub = sinon.stub( StackUtils, 'extractEventKey' ).returns( knowKey );
    const findStub = sinon.stub( LoggerManager, 'find' ).returns( knowLogger );

    XRelicLogs.append( knowArgs );

    assert( extractEventKeyStub.calledOnce );
    assert( findStub.calledOnce );
    assert( findStub.calledWith( knowKey ) );
    assert( appendCalled );
  });

  it('Should intercept error', () => {
    let nextCalled = false;

    const knowError = new Error('Foo');
    const knowNext = () => nextCalled = true;
    const appendStub = sinon.stub( XRelicLogs, 'append' );

    const handler = XRelicLogs.interceptError();
    expect( handler ).to.be.a.function;

    handler( knowError, { }, { }, knowNext );

    assert( appendStub.calledOnce );
    expect( appendStub.getCall(0).args[0] ).to.eql( Logger.FatalSymbol )
    expect( appendStub.getCall(0).args[1] ).to.eql( 'Fatal error on request' )
    expect( appendStub.getCall(0).args[2] ).to.deep.eql( knowError );
  });


  it('Should create a middleware and listen, create a the identifiable stacktrace entry and listen req.end', () => {
    let nextCalled = false;
    let mockReqOnCalled = false;
    let receivedEndFn;

    const mockReqOn = (event, fn) => {
      expect( event ).to.eql( 'end' );
      expect( fn ).to.be.a.function;
      mockReqOnCalled = true;
      receivedEndFn = fn;
    }

    const mockReq = { on: mockReqOn };
    const mockRes = { };
    const mockNext = () => nextCalled = true;

    const knowSubheading = 'foo';
    const pushStub = sinon.stub( LoggerManager, 'push' );
    const removeStub = sinon.stub( LoggerManager, 'remove' );
    const sendStub = sinon.stub( LogSender, 'send' );
    const middleware = XRelicLogs.layup( knowSubheading );

    expect( middleware ).to.be.a.function;
    middleware( mockReq, mockRes, mockNext );

    assert( pushStub.calledOnce );
    expect( pushStub.getCall(0).args[0].constructor.name ).to.eql( 'LoggerKlazz' );
    assert( nextCalled );
    assert( mockReqOnCalled );

    receivedEndFn();

    assert( removeStub.calledOnce );
    assert( removeStub.calledWith( knowKey ) );
    assert( sendStub.calledOnce );
    expect( sendStub.getCall(0).args[0] ).to.deep.eql( knowSettings );
    expect( sendStub.getCall(0).args[1].constructor.name ).to.deep.eql( 'LogBundleKlazz'  );
  });
});
