
const request = require( 'request' );
const RelicLogs = require( '../../index' );

module.exports = {

  async process( ...args ) {
    RelicLogs.append( 'Starting process with', ...args );

    return new Promise( resolve => {
      request( 'http://google.com', () => {
        RelicLogs.append( 'Got response from google' );
        resolve( 'Hi there!' );
      } );
    } );
  }
};
