const chai = require( 'chai' );

const expect = chai.expect;

const defaults = require( '../../../lib/utils/defaults' );

const defaultOutputs = [
  {
    type: 'any',
    serializer: 'console',
    sender: console.log // eslint-disable-line no-console
  }
];
const defaultEnvs = [ 'staging', 'production' ];
const defaultTitle = 'Request Life Cycle';

describe( 'Utils > Defaults test', () => {
  it( 'Should return the know default app configs', () => {
    expect( defaults ).to.have.keys( [ 'outputs', 'envs', 'title' ] );
    expect( defaults.outputs ).to.deep.eql( defaultOutputs );
    expect( defaults.envs ).to.deep.eql( defaultEnvs );
    expect( defaults.title ).to.deep.eql( defaultTitle );
  } );
} );
