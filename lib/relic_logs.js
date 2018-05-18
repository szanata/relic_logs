
require( 'trace' );

Error.stackTraceLimit = Infinity;

const LogBundle = require( './models/log_bundle' );
const Logger = require( './models/logger' );
const StackUtils = require( './utils/stack_utils' );
const LoggerManager = require( './services/logger_manager' );
const LogSender = require( './services/log_sender' );
const defaultSettings = require( './utils/defaults' );

const settings = Object.assign( {}, defaultSettings );

/**
 * @const {String} filename
 * @description The file from where this is being executed so its entries can be excluded from the long stack
 */

module.exports = {

  /**
   * Init RelicLogs
   * Without this nothing works
   * @param {Object} options opts to setup
   */
  init( options ) {
    Object.assign( settings, options );
  },

  /**
   * Prepare a express route to use RelicLogs
   * @param {string} subheading Any identifier to these logs
   * @return {function} express middleware
   */
  intercept( subheading ) {
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
