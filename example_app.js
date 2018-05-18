process.env.NODE_ENV = 'development';

const express = require( 'express' );
const http = require( 'http' );
const Relic = require('./index');

const app = express();
const server = http.createServer( app );

// setup rlc
Relic.init( {
  title: 'Wizardry Test! | ',
  envs: ['development'],
  outputs: [
    {
      type: 'any',
      serializer: 'json',
      sender: console.log
    }, {
      type: 'any',
      serializer: 'console',
      sender: console.log
    }
  ]
} );

// test non error new tick code
app.get('/test', Relic.intercept('Method: GET test'), function ( req, res ) {
  const x = parseInt(req.query.x);

  Relic.append( 'Handling request, arguments:', req.query );

  const p = new Promise( (resolve, reject) => {
    Relic.append( 'Processing data inside a promise' );
    resolve( true );
  });

  setTimeout( function () {
    Relic.append( 'Processing data after setTimeout delay');
    p.then( ok => {
      Relic.append( 'Processing finished', 'All done on promise.then' );
      res.status( 200 ).send( 'Foo' );
    });
  }, x);
});

// test uncaughtException
app.get( '/err', Relic.intercept('Err'), function ( req, res ) {
  Relic.append( 'Starting error request' );
  a = b;
  res.status( 500 ).send( 'Error' );
});

app.use( Relic.interceptError() );

server.listen( 3456 );
