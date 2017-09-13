const path = require('path')

module.exports = function (appPath, protocol, host, publicUrl) {
  return {
    disableHostCheck: process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    compress: true,
    clientLogLevel: 'none',
    contentBase: path.join(appPath, 'dist'),
    watchContentBase: true,
    hot: true,
    publicPath: '/',
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    https: protocol === 'https',
    host: host,
    overlay: false,
    historyApiFallback: {
      disableDotRule: true
    },
    public: publicUrl
  }
}
