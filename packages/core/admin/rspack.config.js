'use strict';

const path = require('path');
const fse = require('fs-extra');

const alias = require('./webpack.alias');
const getClientEnvironment = require('./env');
// const createPluginsExcludePath = require('./utils/create-plugins-exclude-path');

const EE_REGEX = /ee_else_ce\//;

module.exports = ({
  cacheDir,
  dest,
  entry,
  env,
  optimize,
  // pluginsPath,
  options = {
    backend: 'http://localhost:1337',
    adminPath: '/admin/',
    features: [],
  },
  roots = {
    eeRoot: './ee/admin',
    ceRoot: './admin/src',
  },
  // tsConfigFilePath,
}) => {
  const isProduction = env === 'production';

  const envVariables = getClientEnvironment({ ...options, env });

  // const excludeRegex = createPluginsExcludePath(pluginsPath);

  /** @type {import('@rspack/core').Configuration} */
  const config = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    entry: [entry],
    output: {
      path: dest,
      publicPath: options.adminPath,
      // Utilize long-term caching by adding content hashes (not compilation hashes)
      // to compiled assets for production
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].bundle.js',
      chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
    },
    optimization: {
      minimize: optimize,
      moduleIds: 'deterministic',
      // runtimeChunk: true,
    },
    builtins: {
      presetEnv: {
        targets: ['last 3 major versions', 'Firefox ESR', 'last 2 Opera versions', 'not dead'],
      },
      define: envVariables,
      html: [
        {
          template: path.resolve(__dirname, 'index.html'),
          filename: 'index.html',
        },
      ],
    },
    module: {
      rules: [
        {
          test: /\.m?jsx?$/,
          include: cacheDir,
          oneOf: [
            // Use babel-loader for files that distinct the ee and ce code
            // These files have an import Something from 'ee_else_ce/
            {
              test(filePath) {
                if (!filePath) {
                  return false;
                }

                try {
                  const fileContent = fse.readFileSync(filePath).toString();

                  if (fileContent.match(/from.* ['"]ee_else_ce\//)) {
                    return true;
                  }

                  return EE_REGEX.test(fileContent);
                } catch (e) {
                  return false;
                }
              },
              use: {
                loader: require.resolve('babel-loader'),
                options: {
                  cacheDirectory: true,
                  cacheCompression: isProduction,
                  compact: isProduction,
                  presets: [
                    require.resolve('@babel/preset-env'),
                    require.resolve('@babel/preset-react'),
                  ],
                  plugins: [
                    [
                      require.resolve('@strapi/babel-plugin-switch-ee-ce'),
                      {
                        // Imported this tells the custom plugin where to look for the ee folder
                        roots,
                      },
                    ],

                    [
                      require.resolve('@babel/plugin-transform-runtime'),
                      {
                        helpers: true,
                        regenerator: true,
                      },
                    ],
                    [require.resolve('babel-plugin-styled-components'), { pure: true }],
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.js$/,
          type: 'jsx',
        },
        {
          test: /\.ts$/,
          type: 'tsx',
        },
        {
          test: /\.(svg|eot|otf|ttf|woff|woff2)$/,
          type: 'asset/resource',
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.ico$/],
          type: 'asset/resource',
          parser: {
            dataUrlCondition: {
              maxSize: 1000,
            },
          },
        },
        {
          test: /\.(mp4|webm)$/,
          type: 'asset/resource',
          parser: {
            dataUrlCondition: {
              maxSize: 10000,
            },
          },
        },
      ],
    },
    resolve: {
      alias,
      // symlinks: false,
      // extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
      // mainFields: ['browser', 'jsnext:main', 'main'],
      modules: ['node_modules', path.resolve(__dirname, 'node_modules')],
    },
  };

  return config;
};
