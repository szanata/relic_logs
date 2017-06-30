// default configs
module.exports = {
  outputs: [
    {
      type: 'all',
      serializer: 'console',
      sender: console.log // eslint-disable-line no-console
    }
  ],
  /** @deprecated errOutput will be dropped */
  errOutput: [ console.error ], // eslint-disable-line no-console
  /** @deprecated logOutput will be dropped */
  logOutput: [ console.log ], // eslint-disable-line no-console
  envs: [ 'staging', 'production' ],
  title: 'Request Life Cycle'
};
