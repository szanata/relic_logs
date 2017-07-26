/**
* File info discovery
*/

const path = require( 'path' );
const StackUtils = require( './stack_utils' );

const defaultStackUp = 4;

Error.stackTraceLimit = Error.stackTraceLimit <= 10 ? 15 : Error.stackTraceLimit;

module.exports = {

  /**
   * Get the file, line and fn name where some event had ocurred
   * @param {Number} stackUp How many lines after the first should be discarted to find the right line where the event occured
   * @return {String} Metadata in this format: "file:line (func)"
   */
  lineInfo( ) {
    const stackUp = process.env.RELIC_LOGS_TRACER_STACK_UP || defaultStackUp;

    const stack = StackUtils.removeInternalFrames( new Error().stack );

    const [ fileFunc, line ] = stack.split( '\n' )[stackUp].split( ':' );

    const [ baseFn, baseFile ] = fileFunc.includes( ' (' ) ? fileFunc.split( ' (' ) : [ '??', fileFunc ];

    const fn = baseFn.split( ' ' ).pop();
    const file = path.basename( baseFile );

    return `${file}:${line} (${fn})`;
  }
};
