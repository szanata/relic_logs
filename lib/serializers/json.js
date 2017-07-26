module.exports = {

  /**
   * @param {LogBundle} logBundle a bundle to serialize
   */
  run( logBundle ) {
    return {
      title: logBundle.title,
      env: process.env.NODE_ENV,
      events: logBundle.logs.map( ( info, i ) => ( {
        index: i,
        time: info.meta[0],
        trace: info.meta[1],
        message: info.messages[0],
        subMessages: info.messages.slice( 1 )
      } ) )
    };
  }
};
