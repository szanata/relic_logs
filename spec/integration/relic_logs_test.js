const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const fs = require( 'fs' );
const path = require( 'path' );

process.env.NODE_ENV = 'test';

const outPath = path.join( __dirname, 'out' );
const { assert } = chai;
const app = require( './fake_app' );

chai.use( chaiHttp );

describe( 'Integration > Relic Logs full action', () => {
  it( 'Should log all parts of the request life cycle', async () => {
    await chai.request( app ).get( '/foo' ).query( { name: 'audi' } );

    const output = fs.readFileSync( outPath, 'utf8' );

    assert( output.includes( 'Event 0' ) );
    assert( output.includes( 'Event 1' ) );
    assert( output.includes( 'Event 2' ) );
    assert( output.includes( 'Event 3' ) );
  } );
} );
