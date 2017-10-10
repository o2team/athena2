const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
// const WebpackDevServer = require('webpack-dev-server')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')
const express = require('express')
const webpackMerge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ora = require('ora')

const { getRootPath, isEmptyObject, formatTime } = require('../util')
const open = require('../util/open')
const formatWebpackMessage = require('../util/format_webpack_message')

const app = express()

const {
  getConf,
  getAppBuildConfig,
  getEntry,
  getPageHtml,
  createCompiler,
  prepareUrls,
  BUILD_APP,
  BUILD_MODULE,
  BUILD_NONE
} = require('./index')

module.exports = function serve (args, options) {
  const conf = getConf()
  conf.args = args
  switch (conf.buildType) {
    case BUILD_APP:
      serveApp(conf, options)
      break
    case BUILD_MODULE:
      serveModule(conf, options)
      break
    case BUILD_NONE:
      console.log(chalk.red('✖ Serve error, the current directory is not an app or a module!'))
      console.log(chalk.bold('GoodBye!'))
      break
  }
}

function serveCore (conf, options) {
  const serveSpinner = ora(`Starting development server, please wait🤡~`).start()
  const appConf = conf.appConf
  const buildConfig = getAppBuildConfig(conf.appPath)
  const {
    protocol,
    host,
    port,
    publicPath,
    outputRoot,
    chunkDirectory
    // staticDirectory
  } = buildConfig
  conf.buildConfig = buildConfig
  const entry = getEntry(conf)
  if (isEmptyObject(entry)) {
    serveSpinner.fail(chalk.red(`No file to compile, please check if the ${chalk.bold('page')} directories are empty!`))
    console.log(chalk.bold('GoodBye!'))
    process.exit(1)
  }
  const urls = prepareUrls(protocol, host, port)
  const { template, framework, platform } = appConf
  const customWebpackConf = buildConfig.webpack
  const webpackBaseConf = require('../config/base.conf')(conf.appPath, buildConfig, template, platform, framework)
  const webpackDevConf = require('../config/dev.conf')(conf.appPath, buildConfig, template, platform, framework)
  const webpackConf = webpackMerge(webpackBaseConf, webpackDevConf, customWebpackConf)
  const HotMiddleWareConfig = framework !== 'nerv' ? 'webpack-hot-middleware/client' : 'webpack-hot-middleware/client?reload=true'
  const htmlPages = getPageHtml(conf)
  const htmlPlugins = [
    new HtmlWebpackPlugin({
      title: conf.appConf.app,
      filename: 'index.html',
      template: path.join(getRootPath(), 'src', 'config', 'sitemap_template.ejs'),
      alwaysWriteToDisk: true,
      data: {
        htmlPages
      }
    })
  ]
  for (const mod in htmlPages) {
    for (const page in htmlPages[mod]) {
      const pageItem = htmlPages[mod][page]
      htmlPlugins.push(new HtmlWebpackPlugin({
        filename: `${mod}/${pageItem.filename}`,
        template: pageItem.filepath,
        alwaysWriteToDisk: true,
        chunks: [`${mod}/${page}`]
      }))
    }
  }
  htmlPlugins.push(new HtmlWebpackHarddiskPlugin())
  for (const key in entry) {
    const entryItem = entry[key]
    entryItem.unshift(HotMiddleWareConfig)
  }

  webpackConf.entry = entry
  const contentBase = path.join(conf.appPath, outputRoot)
  webpackConf.output = {
    path: contentBase,
    filename: '[name].js',
    publicPath,
    chunkFilename: `${chunkDirectory}/[name].chunk.js`
  }
  webpackConf.plugins = webpackConf.plugins.concat(htmlPlugins)
  const compiler = createCompiler(webpack, webpackConf)
  // console.log(webpackConf)
  const webpackDevServerConf = require('../config/devServer.conf')({
    publicPath,
    contentBase,
    protocol,
    host,
    publicUrl: urls.lanUrlForConfig,
    quiet: true,
    hot: true
  })
  const webpackDev = WebpackDevMiddleware(compiler, webpackDevServerConf)
  const webpackHot = WebpackHotMiddleware(compiler, {
    log: false,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  })
  app.use(webpackDev)
  app.use(webpackHot)
  app.listen(port, host, err => {
    if (err) {
      return console.log(err)
    }
  })
  // devServer.listen(port, host, err => {
  //   if (err) {
  //     return console.log(err)
  //   }
  // })
  let isFirstCompile = true
  compiler.plugin('invalid', filepath => {
    console.log(chalk.grey(`[${formatTime()}]Modified: ${filepath}`))
    serveSpinner.text = 'Compiling...🤡~'
    serveSpinner.render()
  })
  compiler.plugin('done', stats => {
    const { errors, warnings } = formatWebpackMessage(stats.toJson({}, true))
    const isSuccess = !errors.length && !warnings.length
    if (isSuccess) {
      serveSpinner.succeed(chalk.green('Compile success!\n'))
    }
    if (errors.length) {
      errors.splice(1)
      serveSpinner.fail(chalk.red('Compile failed!\n'))
      console.log(errors.join('\n\n'))
      console.log()
    }
    if (isFirstCompile) {
      console.log(chalk.cyan('> Listening at ' + urls.lanUrlForTerminal))
      console.log(chalk.cyan('> Listening at ' + urls.localUrlForBrowser))
      console.log()
      open(urls.localUrlForBrowser)
      isFirstCompile = false
    }
  })
}

function serveApp (conf, options) {
  conf.moduleList = conf.args
  delete conf.args
  if (!conf.moduleList || !conf.moduleList.length) {
    conf.moduleList = conf.appConf.moduleList
  }
  console.log(`Current building modules ${chalk.bold(conf.moduleList.join(' '))}!`)
  serveCore(conf, options)
}

function serveModule (conf, options) {
  const moduleConf = conf.moduleConf
  conf.moduleList = [moduleConf.module]
  delete conf.args
  console.log(`Current building module ${chalk.bold(conf.moduleList[0])}!`)
  serveCore(conf, options)
}
