
const request = require('request');
const RelicLogs = require('../../x_relic_logs');

module.exports = {

  async process(...args) {

    RelicLogs.append('Starting process with', ...args);

    return new Promise( (resolve, reject) => {

      request('http://google.com', (err, response) => {

        RelicLogs.append('Got response from google');
        resolve(true);
      });
    });
  }
};
