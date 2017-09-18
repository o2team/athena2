const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackMerge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ora = require('ora')

const { getRootPath } = require('../util')
const open = require('../util/open')
const formatWebpackMessage = require('../util/format_webpack_message')

const {
  getConf,
  getEntry,
  getPageHtml,
  createCompiler,
  prepareUrls,
  PROTOCOL,
  HOST,
  PORT,
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
      throw new Error('Serve error, the current directory is not an app or a module!')
  }
}

function serveCore (conf, options) {
  const serveSpinner = ora(`Starting development server, please wait🤡~`).start()
  const urls = prepareUrls(PROTOCOL, HOST, PORT)
  const appConf = conf.appConf
  const { template, framework, platform } = appConf
  const webpackBaseConf = require('../config/base.conf')(conf.appPath, template, platform, framework)
  const webpackDevConf = require('../config/dev.conf')(conf.appPath, template, platform, framework)
  const webpackDevServerConf = require('../config/devServer.conf')(conf.appPath, PROTOCOL, HOST, urls.lanUrlForConfig)
  const webpackConf = webpackMerge(webpackBaseConf, webpackDevConf)
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
  const entry = getEntry(conf)
  for (const key in entry) {
    const entryItem = entry[key]
    entryItem.unshift(require.resolve('webpack/hot/dev-server'))
    entryItem.unshift(require.resolve('webpack-dev-server/client') + '?/')
  }
  webpackConf.entry = entry
  webpackConf.output = {
    path: path.join(conf.appPath, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: 'chunk/[name].chunk.js'
  }
  webpackConf.plugins = webpackConf.plugins.concat(htmlPlugins)
  const compiler = createCompiler(webpack, webpackConf)
  const devServer = new WebpackDevServer(compiler, webpackDevServerConf)
  devServer.listen(PORT, HOST, err => {
    if (err) {
      return console.log(err)
    }
  })
  let isFirstCompile = true
  compiler.plugin('invalid', () => {
    serveSpinner.render()
    serveSpinner.text = 'Compiling...🤡~'
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
