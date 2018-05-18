const chai = require( 'chai' );
const sinon = require( 'sinon' );

const expect = chai.expect;
const assert = chai.assert;

// to stub
const Stringifier = require( '../../../lib/services/stringifier' );

const { sym, ctrl } = require( '../../../lib/utils/chars' );
const StringSerializer = require( '../../../lib/serializers/string' );

describe( 'Serializers > String test', () => {
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
    StringSerializer.run( logBundleMock );

    assert( stringifyStub.calledThrice );
    assert( stringifyStub.calledWith( true ) );
    assert( stringifyStub.calledWith( false ) );
    assert( stringifyStub.calledWith( 'foo' ) );
  } );

  it( 'Should serialize the logBundle as a well formatted string', () => {
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

    const expected = `${`${sym.blnkLnBr}[${process.env.NODE_ENV}] Test\n${sym.line}\n` +
      'Event 0: 2017-03-06 test.js:23 (foo)' +
      `${sym.lv1Bullet}Main message` +
      `${sym.lv2Bullet}sub message 1` +
      `${sym.lv2Bullet}sub message 2`
      }${sym.blnkLnBr
      }Event 1: 2017-03-07 test.js:34 (bar)${sym.lv1Bullet}Another message${sym.lv2Bullet}sub message 3${sym.blnkLnBr}`;

    const result = StringSerializer.run( logBundleMock );
    expect( result ).to.eql( expected );

    console.log( `\n\n${ctrl.yellow}String Serialization Sample` );
    console.log( `${ctrl.red}---------------------------${ctrl.reset}` );
    console.log( result );
  } );
} );
