const chai = require( 'chai' );
const sinon = require( 'sinon' );
const mock = require( 'mock-require' );

const expect = chai.expect;
const assert = chai.assert;

const knownKey = 'foo_888-768';

const testSettings = {
  title: 'Bar',
  envs: [ 'staging' ],
  outputs: [ {
    type: 'log',
    serializer: 'console',
    sender: () => { }
  } ]
};

class LogBundleKlazz {
  append() { }
}

class LoggerKlazz {
  constructor() {
    this.key = knownKey;
    this.logBundle = new LogBundleKlazz();
  }
  static get FatalSymbol() {
    return Symbol.for( 'fatal' );
  }
}

describe( 'Request Life Cycle Logs tests', () => {
  let RelicLogs;
  let StackUtils;
  let LoggerManager;
  let LogSender;
  let Logger;
  const oldProcess = process.env.NODE_ENV;

  // Call here to avoid conflic with other tests that clear cache
  before( () => {
    Logger = require( '../../lib/models/logger' );
    StackUtils = require( '../../lib/utils/stack_utils' );
    LoggerManager = require( '../../lib/services/logger_manager' );
    LogSender = require( '../../lib/services/log_sender' );
  } );

  afterEach( () => {
    if ( LogSender.send.restore ) { LogSender.send.restore(); }
    if ( LoggerManager.find.restore ) { LoggerManager.find.restore(); }
    if ( RelicLogs.append.restore ) { RelicLogs.append.restore(); }
    if ( StackUtils.extractEventKey.restore ) { StackUtils.extractEventKey.restore(); }
    process.env.NODE_ENV = oldProcess;
  } );

  // get a new relic logs
  beforeEach( () => {
    // remove from cache
    const path = '../../lib/relic_logs';
    delete require.cache[require.resolve( path )];

    process.env.NODE_ENV = 'staging';

    mock( '../../lib/models/logger', LoggerKlazz );
    mock( '../../lib/models/log_bundle', LogBundleKlazz );
    RelicLogs = require( path );
    RelicLogs.init( testSettings );
    mock.stop( '../../lib/models/log_bundle' );
    mock.stop( '../../lib/models/logger' );
  } );

  it( 'Should append some logs', () => {
    let appendCalled = false;

    const knownArgs = [ 'foo', 'bar' ];
    const knownLogger = {
      appendToBundle( ..._args ) {
        appendCalled = true;
        expect( ..._args ).to.deep.eql( knownArgs );
      }
    };
    const extractEventKeyStub = sinon.stub( StackUtils, 'extractEventKey' ).returns( knownKey );
    const findStub = sinon.stub( LoggerManager, 'find' ).returns( knownLogger );

    RelicLogs.append( knownArgs );

    assert( extractEventKeyStub.calledOnce );
    assert( findStub.calledOnce );
    assert( findStub.calledWith( knownKey ) );
    assert( appendCalled );
  } );

  it( 'Should intercept error', () => {
    let nextCalled = false;

    const knownError = new Error( 'Foo' );
    const knownNext = function () { nextCalled = true; };
    const appendStub = sinon.stub( RelicLogs, 'append' );

    const handler = RelicLogs.interceptError();
    expect( handler ).to.be.a( 'function' );

    handler( knownError, { }, { }, knownNext );

    assert( nextCalled );
    assert( appendStub.calledOnce );
    expect( appendStub.getCall( 0 ).args[0] ).to.eql( Logger.FatalSymbol );
    expect( appendStub.getCall( 0 ).args[1] ).to.eql( 'Fatal error on request' );
    expect( appendStub.getCall( 0 ).args[2] ).to.deep.eql( knownError );
  } );


  it( 'Should create a middleware and listen req.end', () => {
    let nextCalled = false;
    let mockReqOnCalled = false;
    let receivedEndFn;

    const mockReqOn = ( event, fn ) => {
      expect( event ).to.eql( 'end' );
      expect( fn ).to.be.a( 'function' );
      mockReqOnCalled = true;
      receivedEndFn = fn;
    };

    const mockReq = { on: mockReqOn };
    const mockRes = { };
    const knownNext = function () { nextCalled = true; };

    const knownSubheading = 'foo';
    const pushStub = sinon.stub( LoggerManager, 'push' );
    const removeStub = sinon.stub( LoggerManager, 'remove' );
    const sendStub = sinon.stub( LogSender, 'send' );
    const middleware = RelicLogs.intercept( knownSubheading );

    expect( middleware ).to.be.a( 'function' );
    middleware( mockReq, mockRes, knownNext );

    assert( pushStub.calledOnce );
    expect( pushStub.getCall( 0 ).args[0].constructor.name ).to.eql( 'LoggerKlazz' );
    assert( nextCalled );
    assert( mockReqOnCalled );

    receivedEndFn();

    assert( removeStub.calledOnce );
    assert( removeStub.calledWith( knownKey ) );
    assert( sendStub.calledOnce );
    expect( sendStub.getCall( 0 ).args[0] ).to.deep.eql( testSettings );
    expect( sendStub.getCall( 0 ).args[1].constructor.name ).to.deep.eql( 'LogBundleKlazz' );
  } );
} );
