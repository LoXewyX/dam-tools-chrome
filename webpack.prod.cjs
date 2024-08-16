const { merge } = require('webpack-merge');
const config = require('./webpack.config.cjs');

module.exports = merge(config, {
  mode: 'production',
});
