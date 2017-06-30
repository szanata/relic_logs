const SerializerInvoker = require( '../serializers/invoker' );

const typeConfigToSend = {
  err: [ 'any', 'uncaughtException' ],
  log: [ 'any', 'log' ]
};

function filterOutput( type, output ) {
  return !output.type || typeConfigToSend[type].includes( output.type );
}

function sendToOutput( logBundle, output ) {
  output.sender( SerializerInvoker.run( output.serializer, logBundle ) );
}

module.exports = {

  /**
   * @param {Object} settings App settings
   * @param {LogBundle} logBundle A log bundle instance
   */
  send( settings, logBundle ) {
    const type = logBundle.errorIntercepted ? 'err' : 'log';

    /** @deprecated Support to this will drop soon */
    if ( settings[`${type}Output`] ) {
      const log = SerializerInvoker.run( 'console', logBundle );
      settings[`${type}Output`].forEach( fn => fn( log ) );
      return;
    }

    const filter = filterOutput.bind( this, type );
    const send = sendToOutput.bind( this, logBundle );
    settings.outputs.filter( filter ).forEach( send );
  }
};
