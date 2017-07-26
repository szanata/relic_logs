const { sym } = require( '../utils/chars' );
const stringifier = require( '../services/stringifier' );

const templates = {
  title: `${sym.blnkLnBr}[:env] :title\n${sym.line}\n`,
  event: `Event :i: :meta0 :meta1${sym.lv1Bullet}:messages`
};
module.exports = {

  // Serialize to a plain string version (with line breaks)
  run( logBundle ) {
    const title = templates.title.replace( ':title', logBundle.title ).replace( ':env', process.env.NODE_ENV );
    const events = logBundle.logs.map( ( info, i ) => templates.event.replace( ':i', i )
        .replace( ':meta0', info.meta[0] )
        .replace( ':meta1', info.meta[1] )
        .replace( ':messages', info.messages.map( stringifier.stringify ).join( sym.lv2Bullet ) ) ).join( sym.blnkLnBr );

    return `${title}${events}${sym.blnkLnBr}`;
  }
};
