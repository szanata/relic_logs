const chai = require( 'chai' );

const expect = chai.expect;

const JsonSerializer = require( '../../../lib/serializers/json' );

describe( 'Serializers > Json test', () => {
  it( 'Should serialize the logBundle as a JSON object', () => {
    const logBundleMock = {
      title: 'Test',
      logs: [
        {
          meta: [ '2017-03-06', 'test.js:23 (foo)' ],
          messages: [ 'Main message', 'sub message 1', 'sub message 2' ]
        },
        {
          meta: [ '2017-03-07', 'test.js:34 (bar)' ],
          messages: [ 'Another message', 'sub message 3' ]
        }
      ]
    };
    const expected = {
      title: 'Test',
      env: 'test',
      events: [
        {
          index: 0,
          time: '2017-03-06',
          trace: 'test.js:23 (foo)',
          message: 'Main message',
          subMessages: [ 'sub message 1', 'sub message 2' ]
        },
        {
          index: 1,
          time: '2017-03-07',
          trace: 'test.js:34 (bar)',
          message: 'Another message',
          subMessages: [ 'sub message 3' ]
        }
      ]
    };
    const result = JsonSerializer.run( logBundleMock );
    expect( result ).to.deep.eql( expected );
    expect( result.events[0].subMessages ).to.deep.eql( expected.events[0].subMessages );
  } );
} );
