
const express = require( 'express' );
const RelicLogs = require( '../../index' );
const fakeLib = require( './fake_lib' );
const fs = require( 'fs' );
const path = require( 'path' );

const outputSender = content => fs.writeFileSync( path.join( __dirname, 'out' ), content, 'utf8' );

const app = express();

RelicLogs.init( {
  envs: [ 'test', 'development' ],
  title: 'Mock App',
  outputs: [
    {
      type: 'any',
      serializer: 'console',
      sender: console.log // eslint-disable-line no-console
    }, {
      type: 'any',
      serializer: 'string',
      sender: outputSender
    }
  ]
} );

app.get( '/foo', RelicLogs.intercept( '/foo' ), async ( req, res ) => {
  RelicLogs.append( 'Request started' );
  const result = await fakeLib.process( req.query );

  RelicLogs.append( 'Request end', `result: ${result}` );
  res.status( 200 ).send( result );
} );

app.use( RelicLogs.interceptError() );
app.use( ( req, res, next, err ) => {
  res.status( 500 ).send( err );
} );

module.exports = app; // for tests
