# Request Life Cycle Logs aka "Relic Logs"
```
╔══════╗ ╔══════╗ ╔═╗      ╔══════╗ ╔══════╗
║ ╔══╗ ║ ║ ╔════╝ ║ ║      ╚═╗ ╔══╝ ║ ╔══╗ ║
║ ║  ║ ║ ║ ║      ║ ║        ║ ║    ║ ║  ╚═╝
║ ╚══╝ ║ ║ ╚══╗   ║ ║        ║ ║    ║ ║      ╭╮   ╭⎻⎻⎻╮╭⎻⎻⎻╮╭⎻⎻⎻╮
║ ╔╗ ╔═╝ ║ ╔══╝   ║ ║        ║ ║    ║ ║      ││   ││⎺││││⎺⎺ ││⎺⎺
║ ║╚╗╚╗  ║ ║      ║ ║        ║ ║    ║ ║  ╔═╗ ││   ││ ││││⎻⎻╮│╰⎻⎻╮
║ ║ ╚╗╚╗ ║ ╚════╗ ║ ╚════╗ ╔═╝ ╚══╗ ║ ╚══╝ ║ ││__ ││_││││̅_││ ̅_̅_││
╚═╝  ╚═╝ ╚══════╝ ╚══════╝ ╚══════╝ ╚══════╝ ╰───╯╰───╯╰───╯╰───╯

 ▓▓▓▓▓▓▓▓▓▓▓▓▓◤░░░░░░◥▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓◤░░░░░░░░░░░░░░◥▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓◤░░░░░░░░´    `░░░░░░░░◥▓▓▓▓▓
 ▓▓◤░░░░░░░░░´_⎯⎯⎯__* `░░░░░░░░░◥▓▓
 ▓▓◣░░░░░░░░░ˎ̽́★͘★ ★ ͙‾‾ˏ░░░░░░░░░◢▓▓
 ▓▓▓▓▓◣░░░░░░░░ˎ★͘ ͙★͘ˏ░░░░░░░░◢▓▓▓▓
 ▓▓▓▓▓▓▓▓▓◣░░░░░░░░░░░░░░◢▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓◣░░░░░░◢▓▓▓▓▓▓▓▓▓▓▓▓▓

```

A library to group and display all logs from a request, including those from async events triggered by it.

### Example

Output example:

![Example](http://i.imgur.com/GHbrNKR.jpg?1)

### Usage

This lib have two implementations, the [classic](#user-content-classic-implementation) and the [eXperimental](#user-content-experimental-implementation)

Difference is classic does need to expose a instance and send to each decency to create the logs, whereas the experimental does this by reflection, just using a singleton, does make the code decoupled.

When eXperimental is considered ready, the classic will be deprecated.

## Classic implementation

### 1. Install & import

`npm install relic_logs`

```js
const RelicLogs = require('relic_logs');
```

### 2. Init

```js
app.use( RelicLogs.init( options ) );
```
*Init before any express route declaration!*

### 3. Setup
The options is a object with the following:

| Prop | Description | Default Value |
| ------ | ----------- | ------------- |
| envs | Array of environments where the lib will produce output | `["staging", "production"]` |
| title | The default title for the logs of a request | Request Life Cycle |
| outputs | Array of outputs objects to send the logs after the requests | *see below* |
| outputs[].type | What type of logs this output will send. **any** sends all types, **logs** sends just logs by the user "*append*" and **uncaughtException** send just unexpected errors caught by Relic | `any'` |
| outputs[].serializer | What is the format this logs will be sent. **console** send those as colored terminal strings (like the print here), **string** sends plain string (with \r \n) and **json** send as a object | `'console'` |
| outputs[].sender | What function will be used to send logs. | console.log |

#### Outputs Options ####
A js object as this:
```js
  [
    {
      type: 'any',
      serializer: 'console',
      sender: console.log
    }
  ]
```

### 4. Setup routes

Set all routes you want to have a life cycle logging using the `intercept` middleware.

```js
router.get('/foo', RelicLogs.intercept( 'subheading' ), function (req, res) {
  // some code
});
```

The `intercept()` method accepts one *optional* parameters, a subheading to be displayed together of the default title.

### 5. Appending logs

Inside the route of the previous example, a `rlc` object (relic instance) will be made available inside `res.locals`. Use this to append logs to this request cycle.

```js
router.get('/foo', RelicLogs.intercept( 'subheading' ), function (req, res) {
  res.locals.rlc.append( 'Starting the code with some params', req.query );
  // processing
  res.locals.rlc.append( 'Responding to user', code, message );
});
```

The first parameter in the `append` will be the main message of the event, the others are sub messages, displayed as a second level.

### 6. Intercept uncaughtExceptions

```js
app.use( RelicLogs.interceptError( ) );
```
Make sure to put this after all routes and middlewares to intercept any uncaught error. Express stuff, check it [here](https://expressjs.com/en/guide/error-handling.html)


## eXperimental Implementation

This implementation uses reflection to discovery what request triggered the call to the append method, so it is not necessary to have a instance of relic, just call a `append` direct from the library. The rest is the same as the other implementation.

### 1. Install & Import

`npm install relic_logs`

```js
const XRelicLogs = require('relic_logs').loadExperimental();
```

### 2. Init

```js
XRelicLogs.init( options );
```

### 3. Options

Same as the other implementation

### 4. Setup routes

Same behavior, just a different method name:
```js
router.get('/foo', XRelicLogs.layup( 'subheading' ), function (req, res) {
  // some code
});
```

### 5. Appending logs

Just use `Relic.append` inside the express route handler or any class, function, promise or timeout that is called furthermore.

```js
const Relic = require('relic_logs').loadExperimental();

router.get('/foo', RelicLogs.layup( ), function (req, res) {
  Relic.append( 'Starting the code with some params', req.query );
  // processing
  Relic.append( 'Responding to user', code, message );
});
```

### 6. Intercept uncaughtExceptions

Same as other implementation

## Enjoy!!!
