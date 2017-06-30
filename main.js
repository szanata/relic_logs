/**
 * This exists to not break backwards compatibiliy
 */

const RelicLogs = require( './relic_logs' );
const XRelicLogs = require( './x_relic_logs' );

module.exports = Object.assign( {}, RelicLogs, { x: XRelicLogs } );
