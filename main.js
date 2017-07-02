/**
 * Start point for this library
 * @module main
 */
const RelicLogs = require( './relic_logs' );

// mix the RelicLogs with its eXperimental part
module.exports = Object.assign( { }, RelicLogs, {
  loadExperimental() {
    const xrelic = require( './x_relic_logs' );
    return xrelic;
  }
} );
