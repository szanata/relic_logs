// default configs
module.exports = {
  outputs: [
    {
      type: 'any',
      serializer: 'console',
      sender: console.log // eslint-disable-line no-console
    }
  ],
  envs: [ 'staging', 'production' ],
  title: 'Request Life Cycle'
};
