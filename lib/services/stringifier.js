/**
* Stringify given bit of info
*/
module.exports = {
  stringify( info ) {
    if ( info === undefined || info === null ) { return ''; } // empty
    if ( typeof info === 'string' ) { return info; }  // string
    if ( info instanceof Error ) { return `${info.message}${info.stack ? ( ` ${info.stack.split( '\n' )[1]}` ) : ''}`; } // error stack
    if ( info.constructor.name === 'Object' ) { return JSON.stringify( info ); } // common object
    if ( info.toString ) { return info.toString(); } // has toString method
    return info; // let nature decide
  }
};
