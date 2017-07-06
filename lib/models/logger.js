const Uuid = require( 'uuid' );

const prefix = 'andromeda_';

/**
 * @class Logger
 * Creates a logger instance, with a logBundle and a unique key.
 */
module.exports = class Logger {

  /**
   * @constructor
   * @param {LogBundle} logBundle a new logBundle
   * @property {LogBundle} this.logBundle - The instance of the logBundle
   * @property {String} this.uuid - the unique identifier of this instance
   * @property {String} this.key - The key from this instance
   */
  constructor( logBundle ) {
    this.uuid = Uuid.v1();
    this.key = `${prefix}_${this.uuid}`;
    this.logBundle = logBundle;
  }

  /**
   * Return a symbol to indicate a fatal error;
   */
  static get FatalSymbol() {
    return Symbol.for( 'fatal' );
  }

  /**
   * Append some log info to the logBundle
   * If the first param is a Symbol "FatalSymbol", append as an error.
   * Append as a log otherwise
   * @param {...Object|Primitive} args Log info
   */
  appendToBundle( ...args ) {
    // if the first arg is the fatalSymbol, it is flagged as a uncaughtException
    if ( args[0] === Logger.FatalSymbol ) {
      this.logBundle.appendError( ...args.slice( 1 ) );
    } else {
      this.logBundle.append( ...args );
    }
  }
};
