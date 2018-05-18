const { assert, expect } = require( 'chai' );

const Timestamp = require( '../../../lib/utils/timestamp' );

describe( 'Utils > Timestamp test', () => {
  it( 'Should return "now" time in the expected format', () => {
    const now = Timestamp.now();
    assert( /\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/.test( now ) );
  } );

  it( 'Should use as "now" the date/time from the moments its called', () => {
    const now = Timestamp.now();
    const nowDate = new Date();

    const [ datePart, timePart ] = now.split( ' ' );
    const [ year, month, day ] = datePart.split( '-' ).map( v => parseInt( v, 10 ) );
    const [ hour, minute, second ] = timePart.split( ':' ).map( v => parseInt( v, 10 ) );

    expect( year ).to.eql( nowDate.getUTCFullYear() );
    expect( month ).to.eql( nowDate.getUTCMonth() + 1 );
    expect( day ).to.eql( nowDate.getUTCDate() );
    expect( hour ).to.eql( nowDate.getUTCHours() );
    expect( minute ).to.eql( nowDate.getUTCMinutes() );
    expect( second ).to.eql( nowDate.getUTCSeconds() );
  } );
} );
