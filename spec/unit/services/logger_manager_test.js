const { expect } = require( 'chai' );

describe( 'Services > LoggerManager test', () => {
  let loggersSym;
  let LoggerManager;

  beforeEach( () => {
    // remove from cache
    const path = '../../../lib/services/logger_manager';
    delete require.cache[require.resolve( path )];

    LoggerManager = require( path );
    loggersSym = Object.getOwnPropertySymbols( LoggerManager )[0];
  } );

  it( 'Should append n loggers to the collection', () => {
    const knownLoggers = [ 1, 2, 3 ];
    LoggerManager.push( ...knownLoggers );
    expect( LoggerManager[loggersSym] ).to.deep.eql( knownLoggers );
  } );

  it( 'Should find some logger by its key', () => {
    const knownKey = 'foo';
    const knownLogger = { key: knownKey };
    const knownLoggers = [ { key: 'bar' }, knownLogger, { key: 'zum' } ];

    LoggerManager.push( ...knownLoggers );

    expect( LoggerManager[loggersSym] ).to.deep.eql( knownLoggers );
    expect( LoggerManager.find( knownKey ) ).to.deep.eql( knownLogger );
  } );

  it( 'Should remove some logger by its key', () => {
    const knownKey = 'foo';
    const knownLogger = { key: knownKey };
    const otherLoggers = [ { key: 'bar' }, { key: 'zum' } ];
    const knownLoggers = otherLoggers.concat( knownLogger );

    LoggerManager.push( ...knownLoggers );

    expect( LoggerManager[loggersSym] ).to.deep.eql( knownLoggers );

    LoggerManager.remove( knownKey );

    expect( LoggerManager[loggersSym] ).to.deep.eql( otherLoggers );
  } );
} );
