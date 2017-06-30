const chai = require('chai');
const expect = chai.expect;

const Stringifier = require('../../../lib/services/stringifier');

describe('Services > Stringifier test', () => {

  it('Should return "" when the parameter is null or undefined', () => {
    expect( Stringifier.stringify(null) ).to.eql( '' );
    expect( Stringifier.stringify(undefined) ).to.eql( '' );
  });

  it('Should return the same value when the parameter is already a string', () => {
    expect( Stringifier.stringify('Home') ).to.eql( 'Home' );
    expect( Stringifier.stringify('') ).to.eql( '' );
  });

  it('Should return the a string representation when the parameter is a number', () => {
    expect( Stringifier.stringify(0) ).to.eql( '0' );
    expect( Stringifier.stringify(1) ).to.eql( '1' );
  });

  it('Should return the a the message + the first line of the stack when the parameter is a Error', () => {
    const error1 = new Error('Foo')
    error1.stack = ""
    expect( Stringifier.stringify( error1 ) ).to.eql( 'Foo' );
    const error2 = new Error('Foo')
    error2.stack = "Bar\nZam"
    expect( Stringifier.stringify( error2 ) ).to.eql( 'Foo Zam' );
  });

  it('Should use JSON.stringify when the parameter is a Object literal', () => {
    const obj = { type: 'foo', props: ['bar', 'zam'] };
    expect( Stringifier.stringify( obj ) ).to.eql( JSON.stringify( obj ) );
  });

  it('Should use toString method, when object have it, as last resource', () => {
    expect( Stringifier.stringify( 1 ) ).to.eql( '1' );
    expect( Stringifier.stringify( false ) ).to.eql( 'false' );
    expect( Stringifier.stringify( true ) ).to.eql( 'true' );
    expect( Stringifier.stringify( /^\d{1}/ ) ).to.eql( '/^\\d{1}/' );
    const date = new Date();
    expect( Stringifier.stringify( date ) ).to.eql( date.toString() );
  });
});
