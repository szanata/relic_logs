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
app.get('/test', XRelic.layup('Method: GET test'), function ( req, res ) {
  const x = parseInt(req.query.x);

  XRelic.append( 'Handling request, arguments:', req.query );

  const p = new Promise( (resolve, reject) => {
    XRelic.append( 'Processing data inside a promise' );
    resolve( true );
  });

  setTimeout( function () {
    XRelic.append( 'Processing data after setTimeout delay');
    p.then( ok => {
      XRelic.append( 'Processing finished', 'All done on promise.then' );
      res.status( 200 ).send( 'Foo' );
    });
  }, x);
});

// test uncaughtException
app.get( '/err', XRelic.layup('Err'), function ( req, res ) {
  XRelic.append( 'Starting error request' );
  a = b;
  res.status( 500 ).send( 'Error' );
});

app.use( XRelic.interceptError() );

server.listen( 3555 );
