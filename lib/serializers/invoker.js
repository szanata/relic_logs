const fs = require( 'fs' );
const path = require( 'path' );

const files = fs.readdirSync( __dirname );

const serializers = files
  .map( f => f.replace( '.js', '' ) )
  .filter( f => f !== 'invoker' )
  .reduce( ( obj, f ) => {
    obj[f] = require( path.join( __dirname, f ) ); // eslint-disable-line no-param-reassign, import/no-dynamic-require, global-require
    return obj;
  }, { } );

module.exports = {

  run( type, logBundle ) {
    if ( !serializers[type] ) {
      throw new Error( `Unexpected serializer: ${type}` );
    }
    return serializers[type].run( logBundle );
  }
};
