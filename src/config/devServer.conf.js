module.exports = function ({publicPath, contentBase, protocol, host, publicUrl, historyApiFallback, proxy}) {
  return {
    disableHostCheck: process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    compress: true,
    contentBase,
    watchContentBase: true,
    hot: true,
    inline: true,
    quiet: true,
    publicPath: publicPath,
    // stats: "errors-only",
    watchOptions: {
      ignored: /node_modules/
    },
    https: protocol === 'https',
    host: host,
    overlay: true,
    historyApiFallback: historyApiFallback ? historyApiFallback : {
      disableDotRule: true
    },
    public: publicUrl,
    proxy: proxy ? proxy : {}
  }
}
