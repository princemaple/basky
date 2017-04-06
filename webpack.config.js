const path = require('path');

const {
  EnvironmentPlugin,
  optimize: { UglifyJsPlugin, CommonsChunkPlugin }
} = require('webpack');
const { AotPlugin } = require('@ngtools/webpack');
const postcssScss = require('postcss-scss');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PROD = process.env.ENV == 'production';

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src', 'main.ts'),
    vendor: path.resolve(__dirname, 'src', 'vendor.ts'),
    polyfills: path.resolve(__dirname, 'src', 'polyfills.ts')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: '@ngtools/webpack'
      },
      {
        test: /\.html$/,
        use:{
          loader: 'html-loader',
          options: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?\]?=/]
          }
        }
      },
      {
        test: /\.s?css$/,
        use: [
          'raw-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [
                  require('autoprefixer'),
                  require('postcss-nested'),
                ]
              },
              parser: postcssScss,
              syntax: postcssScss
            }
          }
        ]
      }
    ]
  },

  plugins: (function() {
    let plugins = [
      new EnvironmentPlugin({ PROD: PROD }),
      new CommonsChunkPlugin({
        names: ['app', 'vendor', 'polyfills']
      }),
      new AotPlugin({
        tsConfigPath: './tsconfig.json',
        entryModule: './src/app.module#AppModule'
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        chunksSortMode: (function(order) {
          return function(a, b) {
            return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
          };
        })(['polyfills', 'vendor', 'app'])
      })
    ];

    if (PROD) {
      plugins.push(new UglifyJsPlugin({
        beautify: false,
        mangle: { screw_ie8: true },
        compress: { screw_ie8: true },
        comments: false
      }));
    }

    return plugins;
  })(),

  watchOptions: {
    poll: true,
    aggregateTimeout: 300
  }
};
