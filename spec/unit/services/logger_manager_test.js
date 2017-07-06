const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const assert = chai.assert;

describe('Services > LoggerManager test', () => {

  let loggersSym;
  let LoggerManager;

  beforeEach( () => {
    // remove from cache
    const path = '../../../lib/services/logger_manager';
    delete require.cache[require.resolve(path)];

    LoggerManager = require(path);
    loggersSym = Object.getOwnPropertySymbols( LoggerManager )[0];
  });

  it('Should append n loggers to the collection', () => {
    const knowLoggers = [1,2,3];
    LoggerManager.push( ...knowLoggers );
    expect( LoggerManager[loggersSym] ).to.deep.eql( knowLoggers );
  });

  it('Should find some logger by its key', () => {
    const knowKey = 'foo';
    const knowLogger = { key: knowKey }
    const knowLoggers = [ { key: 'bar' }, knowLogger, { key: 'zum' } ];

    LoggerManager.push( ...knowLoggers );

    expect( LoggerManager[loggersSym] ).to.deep.eql( knowLoggers );
    expect( LoggerManager.find( knowKey ) ).to.deep.eql( knowLogger );
  });

  it('Should remove some logger by its key', () => {
    const knowKey = 'foo';
    const knowLogger = { key: knowKey }
    const otherLoggers = [ { key: 'bar' }, { key: 'zum' } ];
    const knowLoggers = otherLoggers.concat( knowLogger );

    LoggerManager.push( ...knowLoggers );

    expect( LoggerManager[loggersSym] ).to.deep.eql( knowLoggers );

    LoggerManager.remove( knowKey );

    expect( LoggerManager[loggersSym] ).to.deep.eql( otherLoggers );
  });
});
