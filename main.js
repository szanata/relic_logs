/**
 * This exists to not break backwards compatibiliy
 */

const RelicLogs = require( './relic_logs' );

module.exports = Object.assign( {}, RelicLogs, {
  get x() {
    return require( './x_relic_logs' );
  }
} );
