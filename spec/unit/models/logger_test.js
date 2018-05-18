const chai = require( 'chai' );
// const sinon = require( 'sinon' );

const expect = chai.expect;
const assert = chai.assert;

const Logger = require( '../../../lib/models/logger' );

describe( 'Models > Logger test', () => {
  it( 'Should start a new Logger', () => {
    const l = new Logger();
    expect( l.constructor.name ).to.eql( 'Logger' );
  } );

  it( 'Should start a new LogBundle with given logBundle', () => {
    const l = new Logger( 'Foo' );
    expect( l.logBundle ).to.eql( 'Foo' );
  } );

  it( 'Should generate a random uuid when initialized', () => {
    const l = new Logger();
    assert( /[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}/i.test( l.uuid ) );
  } );

  it( 'Should append info to bundle', () => {
    const knowInfo = [ 'foo', 'bar' ];
    const logBundle = {
      append( ...info ) {
        expect( info ).to.deep.eql( knowInfo );
      }
    };
    const l = new Logger( logBundle );

    l.appendToBundle( ...knowInfo );
  } );

  it( 'Should append error to bundle', () => {
    const knowInfo = [ 'foo', 'bar' ];
    const logBundle = {
      appendError( ...info ) {
        expect( info ).to.deep.eql( knowInfo );
      }
    };
    const l = new Logger( logBundle );

    l.appendToBundle( ...[ Logger.FatalSymbol ].concat( knowInfo ) );
  } );
} );
