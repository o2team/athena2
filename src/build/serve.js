const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackMerge = require('webpack-merge')
const ora = require('ora')

const {
  printAthenaVersion
} = require('../util')

const open = require('../util/open')

const {
  getConf,
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
  printAthenaVersion()
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
  webpackConf.entry = entry
  webpackConf.output = {
    path: path.join(conf.appPath, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: 'chunk/[name].chunk.js'
  }
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

function getEntry ({ appConf, appPath, moduleList = [] }) {
  if (!moduleList.length) {
    moduleList = appConf.moduleList
  }
  const entry = {}
  moduleList.forEach(mod => {
    const pagePath = path.join(appPath, mod, 'page')
    const pageDirInfo = fs.readdirSync(pagePath)
    pageDirInfo.forEach(item => {
      const ext = path.extname(item)
      if (!ext.length) {
        let entryPath = path.join(pagePath, item, `${item}.js`)
        if (!fs.existsSync(entryPath)) {
          entryPath = path.join(pagePath, item, `index.js`)
        }
        entry[`${mod}/${item}`] = [
          entryPath
        ]
      }
    })
  })
  return entry
}
