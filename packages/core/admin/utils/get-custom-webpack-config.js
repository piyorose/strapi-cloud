'use strict';

const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const fs = require('fs-extra');
const getWebpackConfig = require('../rspack.config');

const getCustomWebpackConfig = (dir, config) => {
  const adminConfigPath = path.join(dir, 'src', 'admin', 'rspack.config.js');

  let webpackConfig = getWebpackConfig(config);

  if (fs.existsSync(adminConfigPath)) {
    const webpackAdminConfig = require(path.resolve(adminConfigPath));

    if (_.isFunction(webpackAdminConfig)) {
      // Expose the devServer configuration
      if (config.devServer) {
        webpackConfig.devServer = config.devServer;
      }

      webpackConfig = webpackAdminConfig(webpackConfig);

      if (!webpackConfig) {
        console.error(
          `${chalk.red('Error:')} Nothing was returned from your custom webpack configuration`
        );
        process.exit(1);
      }
    }
  }

  return webpackConfig;
};

module.exports = getCustomWebpackConfig;
