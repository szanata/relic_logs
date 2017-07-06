const { sym, ctrl } = require( '../utils/chars' );
const stringifier = require( '../services/stringifier' );


const templates = {
  title: `${ctrl.yellow}${sym.blnkLnBr}[${process.env.NODE_ENV}] :title\n${sym.line}\n${ctrl.reset}`,
  event: {
    line1: `${ctrl.bright}Event :i: ${ctrl.reset}${ctrl.blue}:meta0 ${ctrl.cyan}:meta1${ctrl.reset}`,
    line2: `${ctrl.dim}${sym.lv1Bullet}:messages${ctrl.reset}`
  }
};

module.exports = {

  /**
   * Serialize given bundle to string, with line breaks and colors for Terminals
   * @param {LogBundle} logBundle a bundle to serialize
   */
  run( logBundle ) {
    const title = templates.title.replace( ':title', logBundle.title );

    const events = logBundle.logs.map( ( info, i ) => {
      const l1 = templates.event.line1.replace( ':i', i ).replace( ':meta0', info.meta[0] ).replace( ':meta1', info.meta[1] );
      const l2 = templates.event.line2.replace( ':messages', info.messages.map( stringifier.stringify ).join( sym.lv2Bullet ) );
      return l1 + l2;
    } ).join( sym.blnkLnBr );

    return `${title}${events}${sym.blnkLnBr}${ctrl.reset}`;
  }
};
