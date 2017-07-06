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

A service module to group all logs from same request event loop together
without interference for concurrent requests.

### Example

Output example:

![Example](http://i.imgur.com/GHbrNKR.jpg?1)

### Usage

This lib have two implementations, the **classic** and the **eXperimental**
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

| Prop | Description | Default Value | Obs |
| ------ | ----------- | ------------- | --- |
| envs | Array of environments where the lib will produce output | `["staging", "production"]` | |
| title | The default title for the logs of a request | Request Life Cycle |
| ~~errOutput~~ | Array of functions to to where the logs of request finished by uncaught exceptions will be sent | `[console.error]` | **Deprecated**, use `outputs` instead |
| ~~logOutput~~ | Array of functions where the logs will be sent after the request finishes | `[console.log]` | **Deprecated**, use `outputs` instead |
| outputs | Array of outputs objects to send the logs after the requests | *see below* | |

#### Outputs Options ####
A js object as this:
```js
  [
    {
      type: 'any', // what type of logs cycle this output will receive, can be 'any', 'uncaughtException' and 'logs'.
      serializer: 'console', // type of serializer to be used on the event entries of this cycle. 'console' is a colored string ouput for terminals, 'string' is plain string with line breaks and 'json' is JS object literal.
      sender: console.log // what function will receive this logs after the cycle and will be responsible to send it somewhere
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

Inside the route of the previous example, a `rlc` object will be made available inside the res.locals. Using this, is possible to append events to this life cycle log.

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
Make sure to put this after all routes and middlewares to intercept any uncaught error.



## eXperimental Implementation

This implementation uses meta programming to find the log instance inside intercepted handles and all dependencies accessed from it, to do the same atomic info, but without the need to send a `rlc` parameter to each part of the code.

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

Same as the other implementations

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
