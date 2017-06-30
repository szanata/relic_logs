const chai = require('chai');
const sinon = require('sinon')

const expect = chai.expect;
const assert = chai.assert;

// to stub
const SerializerInvoker = require('../../../lib/serializers/invoker');

const LogSender = require('../../../lib/services/log_sender');

const serializedData = "serialized_data";
const serializer = 'console';

describe('Services > Log Sender test', () => {

  afterEach( () => {
    SerializerInvoker.run.restore();
  });

  describe('Log output', function () {

    it('Should send log output to each "log" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: false };
      let outputCalled = false;
      let outputTwice = false;
      const settings = {
        outputs: [{
          type: 'log',
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }, {
          type: 'log',
          serializer: serializer,
          sender: data => {
            outputTwice = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.calledTwice );
      assert( invokerStub.calledWith( serializer, logBundle ) );
      assert( outputCalled );
    });

    it('Should not send error output to each "log" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: false };
      let outputCalled = false;

      const settings = {
        outputs: [{
          type: 'uncaughtException',
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.notCalled );
      assert( !outputCalled );
    });

    it('Should send log output to each "all" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: false };
      let outputCalled = false;

      const settings = {
        outputs: [{
          type: 'any',
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.calledOnce );
      assert( outputCalled );
    });

    it('Should send log output to each "undefined" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: false };
      let outputCalled = false;

      const settings = {
        outputs: [{
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.calledOnce );
      assert( outputCalled );
    });
  });

  describe('Error output', function () {

    it('Should send error output to each "error" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: true };

      let outputCalled = false;
      let outputTwice = false;
      const settings = {
        outputs: [{
          type: 'uncaughtException',
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }, {
          type: 'uncaughtException',
          serializer: serializer,
          sender: data => {
            outputTwice = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.calledTwice );
      assert( invokerStub.calledWith( serializer, logBundle ) );
      assert( outputCalled );
    });

    it('Should not send error output to each "log" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: true };

      let outputCalled = false;

      const settings = {
        outputs: [{
          type: 'log',
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.notCalled );
      assert( !outputCalled );
    });

    it('Should send error output to each "all" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: true };

      let outputCalled = false;

      const settings = {
        outputs: [{
          type: 'any',
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.calledOnce );
      assert( outputCalled );
    });

    it('Should send log output to each "undefined" output', function () {
      const invokerStub = sinon.stub( SerializerInvoker, 'run' ).returns( serializedData );
      const logBundle = { errorIntercepted: true };

      let outputCalled = false;

      const settings = {
        outputs: [{
          serializer: serializer,
          sender: data => {
            outputCalled = data === serializedData;
          }
        }]
      }

      LogSender.send( settings, logBundle );

      assert( invokerStub.calledOnce );
      assert( outputCalled );
    });
  })
});
