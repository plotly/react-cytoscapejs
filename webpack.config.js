const webpack = require('webpack');
const { env } = require('process');
const path = require('path');

const isProd = env.NODE_ENV === 'production';

let conf = {
  mode: isProd ? 'production' : 'development',

  serve: {
    dev: {
      index: 'demo.html'
    }
  },

  devtool: isProd ? false : 'inline-source-map',

  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'react-cytoscape.js',
    library: 'ReactCytoscape',
    libraryTarget: 'umd'
  },

  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM'
    },
    'prop-types': {
      commonjs: 'prop-types',
      commonjs2: 'prop-types',
      amd: 'prop-types',
      root: 'PropTypes'
    },
    cytoscape: 'cytoscape'
  },

  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }]
  },

  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV'])]
};

module.exports = conf;
