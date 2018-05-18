const stackPrefix = 'Object.andromeda_';

module.exports = {

  /**
   * Given an error get the andromeda event key
   * @param {Error} error An error to get the stack trace from
   * @return {String|null} the event key to find the stack, if any
   */
  extractEventKey( error ) {
    const stackEvents = error.stack.split( 'at ' );
    const event = stackEvents.find( ev => ev.startsWith( stackPrefix ) );
    if ( event ) {
      return event.split( ' ' )[0].match( /Object.([\w-]+)/ )[1];
    }
    return null;
  },

  /**
   * Filter stack trace to remove entries from relic_logs
   *
   * @function module:removeInternalFrames
   * @param {String} stack Some stack trace
   * @return {String} filtered string stack trace
   */
  removeInternalFrames( stack ) {
    const search = '/app/lib';
    return stack.split( '\n' ).filter( row => !row.includes( search ) ).join( '\n' );
  }
};
