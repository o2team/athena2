const path = require('path')
const webpack = require('webpack')

const Util = require('../util')
const browserList = require('./browser_list')

module.exports = function (appPath, buildConfig, template, platform, framework) {
  const { env = {}, defineConstants = {}, staticDirectory, htmlSnippetDirectory = ['component'] } = buildConfig
  let imgName, mediaName, fontName, extName
  const imgLimit = (buildConfig.module && buildConfig.module.base64 && buildConfig.module.base64.imageLimit) || 2000
  const fontLimit = (buildConfig.module && buildConfig.module.base64 && buildConfig.module.base64.fontLimit) || 2000
  if (template === 'h5') {
    imgName = 'img/[name].[hash:8].[ext]'
    mediaName = fontName = extName = 'plugin/[name].[hash:8].[ext]'
  } else {
    imgName = `${staticDirectory}/images/[name].[hash:8].[ext]`
    mediaName = `${staticDirectory}/media/[name].[hash:8].[ext]`
    fontName = `${staticDirectory}/fonts/[name].[hash:8].[ext]`
    extName = `${staticDirectory}/ext/[name].[hash:8].[ext]`
  }
  const jsConfUse = [
    {
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true,
        presets: [
          [require('babel-preset-react-app'), { flow: false, typescript: true }]
        ],
        plugins: [
          require('@babel/plugin-proposal-export-default-from').default
        ].concat(
          platform === 'pc' ? [
            require('babel-plugin-transform-es3-member-expression-literals'),
            require('babel-plugin-transform-es3-property-literals')
          ] : []
        ).concat(
          framework === 'nerv' ? [
            [require('@babel/plugin-transform-react-jsx').default, {
              pragma: 'Nerv.createElement'
            }]
          ] : []
        ).concat(
          framework === 'react' ? [
            [require('@babel/plugin-transform-react-jsx').default]
          ] : []
        )
      }
    }
  ]
  const alias = framework === 'nerv'
    ? {
      '@APP': appPath,
      react: 'nervjs',
      'react-dom': 'nervjs'
    }
    : {
      '@APP': appPath
    }
  if (template !== 'h5' && framework !== 'nerv') {
    jsConfUse.push({
      loader: require.resolve('hot-module-accept')
    })
  }
  return {
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.js|jsx$/,
              exclude: /node_modules/,
              use: jsConfUse
            },
            {
              test: /\.html$/,
              include: new RegExp(htmlSnippetDirectory.join('|')),
              loader: require.resolve('html-loader')
            },
            {
              test: /\.vue$/,
              loader: require.resolve('vue-loader')
            },
            {
              test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
              loader: require.resolve('file-loader'),
              options: {
                name: mediaName
              }
            },
            {
              test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
              loader: require.resolve('file-loader'),
              options: {
                limit: fontLimit,
                name: fontName
              }
            },
            {
              test: /\.(png|jpe?g|gif|bpm|svg)(\?.*)?$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: imgLimit,
                name: imgName
              }
            },
            {
              exclude: /\.js|\.css|\.scss|\.sass|\.html|\.json|\.ejs$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: 2000,
                name: extName
              }
            }
          ]
        }
      ]
    },
    resolve: {
      modules: [path.join(Util.getRootPath(), 'node_modules'), 'node_modules'],
      alias: alias
    },
    resolveLoader: {
      modules: [path.join(Util.getRootPath(), 'node_modules'), 'node_modules']
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        htmlLoader: {
          attrs: ['img:src', 'link:href', 'data-src']
        }
      }),
      new webpack.DefinePlugin(Object.assign({
        'process.env': env
      }, defineConstants))
    ]
  }
}
