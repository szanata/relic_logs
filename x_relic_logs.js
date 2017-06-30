
Error.stackTraceLimit = 40;

require( './lib/utils/longjohn_custom' );
const LogBundle = require( './lib/models/log_bundle' );
const LogSender = require( './lib/services/log_sender' );
const settings = require( './lib/utils/defaults' );

/**
 * @var {originalLogFn} Keeps a clone of the original console.log
 */
const originalLogFn = console.log.bind( console ); // eslint-disable-line no-console

/**
 * @var {fatalSymbol} symbol to be used as identifier of uncaughtExceptions
 */
const fatalSymbol = Symbol( 'fatal' );

/**
 * @var {loggers} all logBundles went here during its exections
 */
const loggers = [];

/**
 * Overwrite console.log
 */
function overwriteConsole() {
  /**
   * Wrapper for the original console.log
   * @param {...Object} args Rest params like original console.log
   * @return {undefined} Original console.log return
   */
  console.log = function log( ...args ) { // eslint-disable-line no-console
    const stackEvents = new Error().stack.split( 'at ' );
    const event = stackEvents.find( ev => ev.startsWith( 'Object.andromeda_' ) );

    if ( !event ) { return originalLogFn( ...args ); }

    const key = event.split( ' ' )[0].replace( /Object\./, '' );
    const entry = loggers.find( logger => logger.id === key );

    if ( !entry ) { return originalLogFn( ...args ); }

    // if the first arg is the fatalSymbol, it is flagged as a uncaughtException
    if ( args[0] === fatalSymbol ) {
      entry.logBundle.appendError( ...args.slice( 1 ) );
    } else {
      entry.logBundle.append( ...args );
    }
  };
}

module.exports = {

  /**
   * Init the RlcLogs
   * Without this nothing works
   * @param {Object} options opts to setup
   */
  init( options ) {
    Object.assign( settings, options );
    if ( settings.envs.includes( process.env.NODE_ENV ) ) {
      overwriteConsole();
    }
  },

  /**
   * Prepare a express route to use RlcLogs
   * @param {string} subheading Any identifier to therese logs
   * @return {function} express middleware
   */
  layup( subheading ) {
    return function ( req, res, next ) {
      const k = `andromeda_${new Date().getTime()}`;

      loggers.push( { id: k, logBundle: new LogBundle( settings.title, subheading ) } );

      // creates the dynamic function to be used as a identifier in the stack
      const o = { [k]( _req, _res, _next ) {
        _next();

        _req.on( 'end', () => {
          const i = loggers.findIndex( logger => logger.id === k );

          if ( i === -1 ) { return; } // log doesn't exist anymore

          const logger = loggers[i];
          LogSender.send( settings, logger.logBundle );
          loggers.splice( i, 1 );
        } );
      } };
      o[k]( req, res, next );
    };
  },

  /**
   * Get internal loggers
   */
  get [Symbol( 'loggers' )]() {
    return loggers.slice();
  },


  /**
   * Used to intercept uncaughtException after the express routes are defined
   * Should be invoked only once, after all routes, using app.use
   * @return {function} Express error handling function, to use with `app.use`
   */
  interceptError( ) {
    return function ( err, req, res, next ) {
      console.log( fatalSymbol, 'Fatal error on request', err ); // eslint-disable-line no-console
      next( err );
    };
  }
};
