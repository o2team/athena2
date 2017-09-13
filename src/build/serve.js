const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackMerge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ora = require('ora')

const { getRootPath } = require('../util')
const open = require('../util/open')

const {
  getConf,
  getEntry,
  getPageHtml,
  createCompiler,
  prepareUrls,
  BUILD_APP,
  BUILD_MODULE,
  BUILD_NONE
} = require('./index')

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
const host = process.env.HOST || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

module.exports = function serve (args, options) {
  const serveSpinner = ora(chalk.green(`Starting development server, please wait🤡~`)).start()
  const conf = getConf()
  const appConf = conf.appConf
  const { template, framework, platform } = appConf
  const webpackBaseConf = require('../config/base.conf')(conf.appPath, template, platform, framework)
  conf.moduleList = args
  switch (conf.buildType) {
    case BUILD_APP:
      serveApp(conf, webpackBaseConf, serveSpinner)
      break
    case BUILD_MODULE:
      serveModule(conf, webpackBaseConf, serveSpinner)
      break
    case BUILD_NONE:
      throw new Error('Serve error, the current directory is not an app or a module!')
  }
}

function serveApp (conf, webpackBaseConf, serveSpinner) {
  const urls = prepareUrls(protocol, host, port)
  const webpackDevConf = require('../config/dev.conf')()
  const webpackDevServerConf = require('../config/devServer.conf')(conf.appPath, urls.lanUrlForConfig)
  const webpackConf = webpackMerge(webpackBaseConf, webpackDevConf)
  const entry = getEntry(conf)
  const htmlPages = getPageHtml(conf)
  const htmlPlugins = [
    new HtmlWebpackPlugin({
      title: conf.appConf.app,
      filename: 'index.html',
      template: path.join(getRootPath(), 'src', 'config', 'sitemap_template.ejs'),
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
        chunks: [`${mod}/${page}`]
      }))
    }
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
  devServer.listen(port, host, err => {
    if (err) {
      return console.log(err)
    }
  })
  devServer.middleware.waitUntilValid(() => {
    serveSpinner.succeed('Build success!')
    console.log()
    console.log(chalk.cyan('> Listening at ' + urls.localUrlForTerminal))
    console.log(chalk.cyan('> Listening at ' + urls.localUrlForBrowser))
    open(urls.localUrlForBrowser)
  })
}

function serveModule () {

}
