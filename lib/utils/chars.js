module.exports = {

  // symbols, like bulles or new lines
  sym: {
    line: '\u2500'.repeat( 50 ),
    blnkLnBr: '\n \n',
    lv1Bullet: '\n  \u2514 ',
    lv2Bullet: '\n     \u2514 '
  },

  // character control to color output
  ctrl: {
    bright: '\x1b[1m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    dim: '\x1b[2m',
    reset: '\x1b[0m',
    cyan: '\x1b[36m'
  }
};
