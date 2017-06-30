const timestamp = require( '../utils/timestamp' );
const tracer = require( '../utils/tracer' );

module.exports = {

  /**
   * Return log entry metadata [timestamp and tracer info]
   */
  run( ) {
    return [ timestamp.now(), tracer.lineInfo( 5 ) ];
  }
};
