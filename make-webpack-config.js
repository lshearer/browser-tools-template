var webpack = require('webpack');
var path = require('path');
var config = require('./config');

module.exports = function makeWebpackConfig(options) {

  options = options || {
      debug: false
  };

  var debug = options.debug;
  var minify = !debug;

  var devtool = minify ? 'source-map' : undefined;

  var svgoConfig = JSON.stringify({
    plugins: [
      {
        removeTitle: true
      },
      {
        convertColors: {
          shorthex: false
        }
      },
      {
        convertPathData: false
      }
    ]
  });

  var autoPrefixerConfig = JSON.stringify({
    browsers: ["last 2 versions", "ie >= 9"]
  });


  var plugins = [];

  if (minify) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
        sourcemaps: true,
      })
    );
  }

  plugins.push(new webpack.optimize.CommonsChunkPlugin({
    // pull out common modules from async dependencies of `loader` entry point chunk
    name: "loader",
    children: true,
    async: true,
  }));

  plugins.push(new webpack.DefinePlugin({
    VERSION: JSON.stringify(require('./package.json').version)
  }));

  return {
    // configuration
    entry: {
      'loader': './src/loader',
      'popup-connector': './src/connectors/popup-connector',
      'dev-tools-panel-connector': './src/connectors/dev-tools-panel-connector'
    },
    externals: {
      // 'underscore': {
      //   commonjs: 'underscore',
      //   commonjs2: 'underscore',
      //   amd: 'underscore',
      //   root: '_',
      // },
      // 'jquery-external': {
      //   commonjs: 'jquery',
      //   commonjs2: 'jquery',
      //   amd: 'jquery',
      //   root: 'jQuery',
      // },
    },
    output: {
      filename: '[name].js',
      chunkFilename: 'chunks/[name]' + (debug ? '' : '.[chunkhash]') + '.js',
      // sourceMapFilename: '[file].map.js',
      path: path.resolve(__dirname, 'dist'),
      library: config.globalExportPrefix + '-[name]',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      pathinfo: !minify,
    },
    module: {
      // TODO - get this working as a loader; isn't reporting any errors right now though
      // preloaders: [
      //   {
      //     test: /\.jsx?$/,
      //     loader: 'eslint',
      //     exclude: /node_modules/
      //   }
      // ],

      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          // loader: 'babel?stage=2'
          loader: 'babel?stage=2&optional[]=runtime'
        },
        {
          test: /\.scss$/,
          loader: 'style!css!autoprefixer?' + autoPrefixerConfig + '!sass'
        },
        {
          test: /\.svg$/,
          loader: 'raw!svgo?' + svgoConfig
        },
        {
          test: /\.jpe?g$/,
          loader: 'url?limit=10000'
        }

      ]
    },
    plugins: plugins,
    devtool: devtool,
  // eslint: {
  //   configFile: path.resolve('./.eslintrc')
  // }
  };
}
