
const MessageSigner = require( '../services/message_signer' );

/**
 * @class LogBundle
 */
module.exports = class LogBundle {

  constructor( title, subtitle ) {
    this.title = title + ( subtitle ? ` ${subtitle}` : '' );
    this.logs = [];
    this.errorInterceptedFlag = false;
  }

  /**
   * Append errors
   * @param {...Object} Messages of a new single event entry
   */
  append( ...data ) {
    const entry = { meta: MessageSigner.run(), messages: data };
    this.logs.push( entry );
  }

  /**
   * Same as append, but also flag this bundle as "errorIntercepted"
   * @param {...Object} Messages of a new single event entry
   */
  appendError( ...data ) {
    this.errorInterceptedFlag = true;
    this.append( ...data );
  }

  /**
   * Return whether there was a fatal error appended to this log
   * @returns {Boolean}
   */
  get errorIntercepted( ) {
    return this.errorInterceptedFlag;
  }

  /**
   * @returns {Number} number of events
   */
  get size( ) {
    return this.logs.length;
  }

  /**
   * @returns {Object} events
   */
  get info( ) {
    return this.logs;
  }
};
