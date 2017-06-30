
let ERROR_ID;
let currentTraceError = null;

const visualStackSplitLine = '---------------------------------------------';
const filename = __filename;
const EventEmitter = require( 'events' ).EventEmitter;
const sourceMap = require( 'source-map-support' );

sourceMap.install();

// format given stack frame using sourcemaps
function formatStackFrame( frame ) {
  if ( frame.getFileName() === visualStackSplitLine ) {
    return visualStackSplitLine;
  }
  return `    at ${sourceMap.wrapCallSite( frame )}`;
}

// format stack
function formatStack( err, frames ) {
  const lines = [];
  // try {
  lines.push( err.toString() );
  // } catch ( _err ) {
  //   console.error( 'longjohn err', _err );
  // }
  lines.push( ...frames.map( formatStackFrame ) );
  return lines.join( '\n' );
}

function prepareStackTrace( error, structuredStackTrace, recursiveCount = 0 ) {
  const defaultPropMeta = { writable: true, enumerable: false, configurable: true };

  if ( error.__cached_trace__ == null ) {
    const cachedTraceValue = structuredStackTrace.filter( f => f.getFileName() !== filename );
    Object.defineProperty( error, '__cached_trace__', Object.assign( { }, defaultPropMeta, { value: cachedTraceValue } ) );

    if ( !error.__previous__ && recursiveCount === 0 ) { // just parent level
      Object.defineProperty( error, '__previous__', Object.assign( { }, defaultPropMeta, { value: currentTraceError } ) );
    }
    if ( error.__previous__ != null ) {
      const previousStack = prepareStackTrace( error.__previous__, error.__previous__.__stack__, recursiveCount + 1 );
      if ( previousStack && previousStack.length > 0 ) {
        error.__cached_trace__.push( ...previousStack );
      }
    }
  }

  if ( recursiveCount > 0 ) {
    return error.__cached_trace__;
  }
  return formatStack( error, error.__cached_trace__ );
}

ERROR_ID = 1;

function wrapCallback( callback, location ) {
  let traceError;

  const originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function ( x, stack ) {
    return stack;
  };
  traceError = new Error();
  Error.captureStackTrace( traceError, wrapCallback );
  traceError.__stack__ = traceError.stack;

  Error.prepareStackTrace = originalPrepareStackTrace;
  traceError.id = ERROR_ID++;
  if ( traceError.stack[1] ) {
    traceError.location = `${traceError.stack[1].getFunctionName()} (${traceError.stack[1].getFileName()}:${traceError.stack[1].getLineNumber()})`;
  } else {
    traceError.location = 'bad call_stack_location';
  }
  traceError.__location__ = location;
  traceError.__previous__ = currentTraceError;
  traceError.__trace_count__ = currentTraceError != null ? currentTraceError.__trace_count__ + 1 : 1;

  const newCallback = function ( ...args ) {
    currentTraceError = traceError;
    traceError = null;
    try {
      return callback.call( this, ...args );
    } catch ( _error ) {
      throw _error;
    } finally {
      currentTraceError = null;
    }
  };
  newCallback.listener = callback;
  return newCallback;
}

// overwrites
const _then = Promise.prototype.then;
const _catch = Promise.prototype.catch;

Promise.prototype.then = function ( ok, error ) { // eslint-disable-line no-extend-native
  const okDb = wrapCallback( ok, 'Promise.then' );
  const errorCb = error ? wrapCallback( error, 'Promise.then' ) : null;
  return _then.call( this, okDb, errorCb );
};

Promise.prototype.catch = function ( cb ) { // eslint-disable-line no-extend-native
  return _catch.call( this, wrapCallback( cb, 'Promise.catch' ) );
};

const _on = EventEmitter.prototype.on;
const _addListener = EventEmitter.prototype.addListener;
const _listeners = EventEmitter.prototype.listeners;

// overwiter emitter
EventEmitter.prototype.addListener = function ( event, callback, ...args ) {
  const wrappedCallback = wrapCallback( callback, 'EventEmitter.addListener' );
  return _addListener.call( this, event, wrappedCallback, ...args );
};

EventEmitter.prototype.on = function ( event, callback, ...args ) {
  if ( !callback.listener ) {
    const wrappedCallback = wrapCallback( callback, 'EventEmitter.on' );
    return _on.call( this, event, wrappedCallback, ...args );
  }

  const wrappedCallback = wrapCallback( callback.listener, 'EventEmitter.once' );
  const wrappedListener = function wrappedListener( ...listenerArgs ) {
    let fired;
    this.removeListener( event, wrappedListener );
    if ( !fired ) {
      fired = true;
      return wrappedCallback.call( this, ...listenerArgs );
    }
  };
  wrappedListener.listener = callback.listener;
  return _on.call( this, event, wrappedListener, ...args );
};

EventEmitter.prototype.listeners = function ( event ) {
  const listeners = _listeners.call( this, event );
  const unwrapped = [];

  for ( let i = 0, li = listeners.length; i < li; i++ ) {
    const item = listeners[i];
    if ( item.listener ) {
      unwrapped.push( item.listener );
    } else {
      unwrapped.push( item );
    }
  }
  return unwrapped;
};

const _nextTick = process.nextTick;

process.nextTick = function ( callback, ...args ) {
  const wrappedCallback = wrapCallback( callback, 'process.nextTick' );
  return _nextTick.call( this, wrappedCallback, ...args );
};

const __nextDomainTick = process._nextDomainTick;

process._nextDomainTick = function ( callback, ...args ) {
  const wrappedCallback = wrapCallback( callback, 'process.nextDomainTick' );
  return __nextDomainTick.call( this, wrappedCallback, ...args );
};

const _setTimeout = global.setTimeout;
const _setInterval = global.setInterval;

global.setTimeout = function ( callback, ...args ) {
  const wrappedCallback = wrapCallback( callback, 'global.setTimeout' );
  return _setTimeout.call( this, wrappedCallback, ...args );
};

global.setInterval = function ( callback, ...args ) {
  const wrappedCallback = wrapCallback( callback, 'global.setInterval' );
  return _setInterval.call( this, wrappedCallback, ...args );
};

if ( global.setImmediate != null ) {
  const _setImmediate = global.setImmediate;
  global.setImmediate = function ( callback, ...args ) {
    const wrappedCallback = wrapCallback( callback, 'global.setImmediate' );
    return _setImmediate.call( this, wrappedCallback, ...args );
  };
}

Error.prepareStackTrace = prepareStackTrace;
