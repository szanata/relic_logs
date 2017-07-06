
/**
 * @module LoggerManager
 *
 * Wraps a logger collection and made it searchable
 */
const loggers = [];

module.exports = {

  /**
   * @name LoggerManager:push
   * Adds new loggers to the collection
   * @param {...Logger} newLoggers N loggers to add
   * @return {void}
   */
  push( ...newLoggers ) {
    loggers.push( ...newLoggers );
  },

  /**
   * @name LoggerManager:find
   * Find and return a logger inside the collection
   * @param {String} key Logger key
   * @return {Logger|null} The logger with the key or null if not found
   */
  find( key ) {
    return loggers.find( l => l.key === key );
  },

  /**
   * @name LoggerManager:remove
   * Remove a logger front the collection
   * @param {String} key Logger key
   * @return {Boolean} true if removed, false otherwise
   */
  remove( key ) {
    const index = loggers.findIndex( l => l.key === key );
    if ( index === -1 ) { return false; }
    return !!loggers.splice( index, index );
  },

  /**
   * @name LoggerManager:Symbol( 'loggers' )
   * Get a copy of all stored loggers
   * @return {Array<Logger>} an array of Loggers
   */
  get [Symbol( 'loggers' )]() {
    return loggers.slice();
  }
};
