process.env.NODE_ENV = 'development';

const express = require( 'express' );
const http = require( 'http' );
const XRelic = require('./x_relic_logs');

const app = express();
const server = http.createServer( app );

// setup rlc
XRelic.init( {
  title: 'Wizardry Test! | ',
  envs: ['development'],
  outputs: [
    {
      type: 'uncaughtException',
      serializer: 'json',
      sender: console.log
    }, {
      type: 'log',
      serializer: 'console',
      sender: console.log
    }
  ]
} );

// test non error new tick code
app.get('/test', XRelic.layup('Method: GET test'), function ( req, res ) {
  const x = parseInt(req.query.x);

  console.log( 'Handling request, arguments:', req.query );

  const p = new Promise( (resolve, reject) => {
    console.log( 'Processing data inside a promise' );
    resolve( true );
  });

  setTimeout( function () {
    console.log( 'Processing data after setTimeout delay');
    p.then( ok => {
      console.log( 'Processing finishe', 'All done on promise.then' );
      res.send( 200, 'foo' );
    });
  }, x);
});

// test uncaughtException
app.get( '/err', XRelic.layup('Err'), function ( req, res ) {
  console.log( 'Starting error request' );
  a = b;
  res.send( 500, 'Error' );
});

app.use( XRelic.interceptError() );

server.listen( 3555 );
