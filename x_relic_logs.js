
const FullStack = require( 'full_stack' );
const LogBundle = require( './lib/models/log_bundle' );
const Logger = require( './lib/models/logger' );
const StackUtils = require( './lib/utils/stack_utils' );
const LoggerManager = require( './lib/services/logger_manager' );
const LogSender = require( './lib/services/log_sender' );
const settings = require( './lib/utils/defaults' );

FullStack.prepare( Promise.prototype, 'then', 0, 1 );

module.exports = {

  /**
   * Init the RlcLogs
   * Without this nothing works
   * @param {Object} options opts to setup
   */
  init( options ) {
    Object.assign( settings, options );
  },

  /**
   * Prepare a express route to use RelicLogs
   * @param {string} subheading Any identifier to therese logs
   * @return {function} express middleware
   */
  layup( subheading ) {
    /**
     * Well know express middleware
     * This creates the bundle for the http route and creates the trap to detect the end of the request
     */
    return function ( req, res, next ) {
      const bundle = new LogBundle( settings.title, subheading );
      const logger = new Logger( bundle );
      LoggerManager.push( logger );

      // creates the dynamic function to be used as a identifier in the stack
      const o = { [logger.key]( _req, _res, _next ) {
        _next();

        _req.on( 'end', () => {
          LoggerManager.remove( logger.key );

          // avoid loggin on unwanted envs (eg test)
          if ( !settings.envs.includes( process.env.NODE_ENV ) ) { return; }

          LogSender.send( settings, logger.logBundle );
        } );
      } };
      o[logger.key]( req, res, next );
    };
  },

  /**
   * Append logs to the bundle
   * @param {...Object|Primitive} args Anything to append to the log
   * @return {boolean} true if appended, false otherwise
   */
  append( ...args ) {
    const key = StackUtils.extractEventKey( new Error() );
    if ( !key ) { return false; }

    const logger = LoggerManager.find( key );
    if ( !logger ) { return false; }

    logger.appendToBundle( ...args );
    return true;
  },


  /**
   * Used to intercept uncaughtException after the express routes are defined
   * Should be invoked only once, after all routes, using app.use
   * @return {function} Express error handling function, to use with `app.use`
   */
  interceptError( ) {
    const self = this;
    return function ( err, req, res, next ) {
      self.append( Logger.FatalSymbol, 'Fatal error on request', err );
      next( err );
    };
  }
};
