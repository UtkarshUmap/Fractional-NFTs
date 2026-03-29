const webpack = require('webpack')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Polyfill Node.js core modules that @stellar/stellar-sdk/rpc needs
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto:  require.resolve('crypto-browserify'),
        stream:  require.resolve('stream-browserify'),
        buffer:  require.resolve('buffer/'),
        http:    false,   // stellar-sdk uses fetch under the hood in browser
        https:   false,
        os:      false,
        url:     false,
        zlib:    false,
      }

      // Make Buffer and process available globally (stellar-sdk expects them)
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer:  ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ]

      return webpackConfig
    },
  },
}