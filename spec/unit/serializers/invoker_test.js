const chai = require( 'chai' );
const sinon = require( 'sinon' );

const expect = chai.expect;

const JsonSerializer = require( '../../../lib/serializers/json' );
const ConsoleSerializer = require( '../../../lib/serializers/console' );
const StringSerializer = require( '../../../lib/serializers/string' );

const invoker = require( '../../../lib/serializers/invoker' );

describe( 'Serializers > Invoker test', () => {
  after( () => {
    JsonSerializer.run.restore();
    ConsoleSerializer.run.restore();
    StringSerializer.run.restore();
  } );

  it( 'Should call the json serializer', () => {
    sinon.stub( JsonSerializer, 'run' ).returns( 'Ok' );
    const serialized = invoker.run( 'json', { } );
    expect( serialized ).to.eql( 'Ok' );
  } );

  it( 'Should call the console serializer', () => {
    sinon.stub( ConsoleSerializer, 'run' ).returns( 'Ok' );
    const serialized = invoker.run( 'console', { } );
    expect( serialized ).to.eql( 'Ok' );
  } );

  it( 'Should call the string serializer', () => {
    sinon.stub( StringSerializer, 'run' ).returns( 'Ok' );
    const serialized = invoker.run( 'string', { } );
    expect( serialized ).to.eql( 'Ok' );
  } );
} );
