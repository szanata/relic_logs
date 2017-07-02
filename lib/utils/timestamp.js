/**
* Time utils
*/

const dateProps = [ 'FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds' ];

module.exports = {

  /**
  * @returns now in a nice string format YYYY-MM-DD hh:mm:ss
  */
  now() {
    const date = new Date();
    const parts = dateProps.map( p => date[`getUTC${p}`]() );
    // js month is 0 based, to need to add 1
    parts[1]++;
    // append all parts with padleft, except first, which is year and is already 4 digits
    const values = [].concat( parts[0], parts.slice( 1 ).map( v => v.toString().padLeft( 2, '0' ) ) );

    // join date with '-', time with ':' and send together split by ' ' (space)
    return `${values.slice( 0, 3 ).join( '-' )} ${values.slice( 3 ).join( ':' )}`;
  }
};
