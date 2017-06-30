const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const assert = chai.assert;

// dependencies to stub
const MessageSigner = require('../../../lib/services/message_signer');

const LogBundle = require('../../../lib/models/log_bundle');

describe('Models > Log Bundle test', () => {

  afterEach( () => {
    if ( MessageSigner.run.restore ) {
      MessageSigner.run.restore();
    }
  });

  it('Should start a new LogBundle', function () {
    const l = new LogBundle();
    expect( l.constructor.name ).to.eql( 'LogBundle' );
  });

  it('Should start a new LogBundle with given title', function () {
    const l = new LogBundle( 'Foo' );
    expect( l.title ).to.eql( 'Foo' );
  });

  it('Should start a new LogBundle with given title and subtitle', function () {
    const l = new LogBundle( 'Foo', 'Bar' );
    expect( l.title ).to.eql( 'Foo Bar' );
  });

  it('Should append info', function () {
    const l = new LogBundle();
    const signerStub = sinon.stub( MessageSigner, 'run' ).returns( [ ] )

    expect( l.size ).to.eql( 0 );

    l.append( 'foo' );
    l.append( 'zumba', 'bar' );
    expect( l.size ).to.eql( 2 );

    assert( signerStub.calledTwice );
  });

  it('Should append error info', function () {
    const l = new LogBundle();
    const signerStub = sinon.stub( MessageSigner, 'run' ).returns( [ ] )

    expect( l.size ).to.eql( 0 );

    l.appendError( 'foo' );
    expect( l.size ).to.eql( 1 );

    assert( signerStub.calledOnce );
  });

  it('Should have "errorIntercepted" status after append error info', function () {
    const l = new LogBundle();
    const signerStub = sinon.stub( MessageSigner, 'run' ).returns( [ ] )

    expect( l.size ).to.eql( 0 );

    l.appendError( 'foo' );
    expect( l.size ).to.eql( 1 );

    assert( l.errorIntercepted );
  });

  it('Should return all info', function () {
    const l = new LogBundle();

    const knowResult1 = { meta: [ 'meta' ], messages: [ '1', '2' ] };
    const knowResult2 = { meta: [ 'meta' ], messages: [ '1', '2' ] };

    sinon.stub( MessageSigner, 'run' ).returns( knowResult1.meta );
    l.append( ...knowResult1.messages );

    MessageSigner.run.restore();
    sinon.stub( MessageSigner, 'run' ).returns( knowResult2.meta );
    l.append( ...knowResult2.messages );

    expect( l.info ).to.deep.eql( [ knowResult1, knowResult2 ] );
  });
});
