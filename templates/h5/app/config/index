const config = {
  // source files root directory
  sourceRoot: 'src',
  // output files root directory
  outputRoot: 'dist',
  // The publicPath specifies the public URL address of the output files when referenced in a browser
  // see https://webpack.js.org/guides/public-path/
  publicPath: '/',
  // the directory contains css/js/images/fonts/media etc. files
  staticDirectory: 'static',
  // define global constants for application see https://webpack.js.org/plugins/define-plugin/
  defineConstants: {
  },
  // 设计稿的宽度 | 默认750，如果开启 Zoom 则直接按照设计稿宽度和屏幕宽度进行缩放
  designLayoutWidth: 750,
  // 设计稿的高度 | 默认1206，如果开启 Zoom 则直接按照设计稿高度和屏幕高度进行缩放
  designLayoutHeight: 1206,
  // Zoom 缩放的基准 | 默认为 'width'，以屏幕的宽度进行缩放
  baseZoomRuler: 'width',
  // 计算 rem 的基数，通常不用修改
  baseSize: 10,
  // 是否用 rem 做适配
  enableREM: true,
  // 是否用 zoom 做适配
  enableZoom: true,
  // support functions
  module: {
    postcss: {
      // autoprefixer plugin config
      autoprefixer: {
        enable: true
      },
      pxtorem: {
        enable: true
      },
      assets: {
        enable: true
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
