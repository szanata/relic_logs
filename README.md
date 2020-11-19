# Request Life Cycle Logs aka "Relic Logs"

![Example](https://raw.githubusercontent.com/szanata/relic_logs/master/doc_resources/json_output.png)

This lib bundle and display all together logs from a HTTP request, **including those from async events** triggered by it. It was envisioned to be used with express js.

This is the 3.0.0 version, whreas the old eXperimental implementation, is now the standard.

## Usage

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

### 3. Setup routes

Set all routes you want to have a life cycle logging using the `intercept` middleware.

```js
router.get('/foo', RelicLogs.intercept( 'subheading' ), function (req, res) {
  // some code
});
```

The `intercept()` method accepts one *optional* parameters, a subheading to be displayed after the log title.

### 4. Appending logs

Just use `Relic.append` inside the express route handler or function, promise or timeout that is called furthermore.

```js
const Relic = require('relic_logs').loadExperimental();

router.get('/foo', RelicLogs.layup( ), function (req, res) {
  Relic.append( 'Starting the code with some params', req.query );
  // processing
  Relic.append( 'Responding to user', code, message );
});
```

The first parameter in the `append` will be the main message of the event, the others are sub messages, displayed as a second level.

### 5. Intercept uncaughtExceptions

```js
app.use( RelicLogs.interceptError( ) );
```
Make sure to put this after all routes and middlewares to intercept any uncaught error. Express stuff, check it [here](https://expressjs.com/en/guide/error-handling.html).

---

## Configurating

The are some customizations that can be made to shape the logger to better suite your needs.

All those are set using the `.init` method.

| Prop | Description | Default Value |
| ------ | ----------- | ------------- |
| envs | Array of environments where the lib will produce output | `["staging", "production"]` |
| title | The title to any bundle of logs | Request Life Cycle |
| outputs | Array of outputs configs. This is used tell Relic where to send the logs it generates, like `console` for example. | *see below* |

### Output configuration

This is a single output. Your app can set any number of those.

| Prop | Description | Default Value |
| ------ | ----------- | ------------- |
| type | What type of logs this output will receive. **any** sends all types, **logs** sends just logs by the user "*append*" and **uncaughtException** send just unexpected errors caught by Relic | `any'` |
| serializer | How this output will format its messages. **console** send those as colored terminal strings (like the print here), **string** sends plain string (with \r \n) and **json** send as a object | `'console'` |
| sender | A function used to expose the logs. Can be `console.log` if you want to just stdout or stderr, but can be a custom function that delivery the logs to somewhere else. | console.log |

#### Console output example:

```js
  [
    {
      type: 'any',
      serializer: 'console'
    }
  ]
```

This will produce this:

![JSON](https://raw.githubusercontent.com/szanata/relic_logs/master/doc_resources/json_output.png)

#### JSON output example


```js
  [
    {
      type: 'any',
      serializer: 'json'
    }
  ]
```

This will produce this:

![JSON](https://raw.githubusercontent.com/szanata/relic_logs/master/doc_resources/console_output.png)
