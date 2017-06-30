const LogBundle = require( './lib/models/log_bundle' );
const LogSender = require( './lib/services/log_sender' );
const settings = require( './lib/utils/defaults' );

module.exports = {

  /**
   * Init method to register a RLC middleware
   */
  init( options ) {
    Object.assign( settings, options );

    return function ( req, res, next ) {
      req.on( 'end', ( ) => {
        const rlc = res.locals.rlc;

        if ( !settings.envs.includes( process.env.NODE_ENV ) ) {
          return next();
        }

        if ( rlc ) {
          LogSender.send( settings, res.locals.rlc );
        }
      } );
      next();
    };
  },

  /**
   * Method to filter express routes that will use RLC
   */
  intercept( subheading ) {
    return function ( req, res, next ) {
      const rlc = new LogBundle( settings.title, subheading );
      res.locals.rlc = rlc;
      next();
    };
  },

  /**
   * Error middleware to log rlc errors (exception scenario)
   */
  interceptError( ) {
    return function ( err, req, res, next ) {
      const rlc = res.locals.rlc;
      if ( rlc ) {
        rlc.appendError( 'Fatal error on request', err );
      }

      next( err );
    };
  }
};
