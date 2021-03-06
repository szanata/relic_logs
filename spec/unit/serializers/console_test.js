const chai = require( 'chai' );
const sinon = require( 'sinon' );

const expect = chai.expect;
const assert = chai.assert;

// to stub
const Stringifier = require( '../../../lib/services/stringifier' );

const { sym, ctrl } = require( '../../../lib/utils/chars' );
const ConsoleSerializer = require( '../../../lib/serializers/console' );

describe( 'Serializers > Console test', () => {
  afterEach( () => {
    if ( Stringifier.stringify.restore ) {
      Stringifier.stringify.restore();
    }
  } );

  it( 'Should stringify each message', () => {
    const logBundleMock = {
      title: 'Test',
      logs: [
        {
          meta: [ '2017-03-06', 'test.js:23 (foo)' ],
          messages: [ true, false, 'foo' ]
        }
      ]
    };

    const stringifyStub = sinon.stub( Stringifier, 'stringify' ).returns( 'Ok' );
    ConsoleSerializer.run( logBundleMock );

    assert( stringifyStub.calledThrice );
    assert( stringifyStub.calledWith( true ) );
    assert( stringifyStub.calledWith( false ) );
    assert( stringifyStub.calledWith( 'foo' ) );
  } );

  it( 'Should serialize the logBundle as a well formatted and colored console output string', () => {
    const logBundleMock = {
      title: 'Test',
      logs: [
        {
          meta: [ '2017-03-06', 'test.js:23 (foo)' ],
          messages: [ 'Main message', 'sub message 1', 'sub message 2' ]
        },
        {
          meta: [ '2017-03-07', 'test.js:34 (bar)' ],
          messages: [ 'Another message', 'sub message 3' ]
        }
      ]
    };

    const expected = `${ctrl.yellow}${sym.blnkLnBr}[${process.env.NODE_ENV}] Test\n${sym.line}\n${ctrl.reset}` +
      `${ctrl.bright}Event 0: ${ctrl.reset}${ctrl.blue}2017-03-06 ${ctrl.cyan}test.js:23 (foo)${ctrl.reset}` +
      `${ctrl.dim}${sym.lv1Bullet}Main message` +
      `${sym.lv2Bullet}sub message 1` +
      `${sym.lv2Bullet}sub message 2${ctrl.reset}` +
      `${sym.blnkLnBr}` +
      `${ctrl.bright}Event 1: ${ctrl.reset}${ctrl.blue}2017-03-07 ${ctrl.cyan}test.js:34 (bar)${ctrl.reset}` +
      `${ctrl.dim}${sym.lv1Bullet}Another message` +
      `${sym.lv2Bullet}sub message 3${ctrl.reset}` +
      `${sym.blnkLnBr}${ctrl.reset}`;

    const result = ConsoleSerializer.run( logBundleMock );
    expect( result ).to.eql( expected );

    console.log( `\n\n${ctrl.yellow}Console Serialization Sample` );
    console.log( `${ctrl.red}---------------------------${ctrl.reset}` );
    console.log( result );
  } );
} );
