// default configs
module.exports = {
  outputs: [
    {
      type: 'all',
      serializer: 'console',
      sender: console.log // eslint-disable-line no-console
    }
  ],
  envs: [ 'staging', 'production' ],
  title: 'Request Life Cycle'
};
