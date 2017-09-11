const path = require('path')
const url = require('url')
const fs = require('fs-extra')
const chalk = require('chalk')

const { getLocalIp, isPrivate } = require('../util')

exports.BUILD_MODULE = 'module'
exports.BUILD_APP = 'app'
exports.BUILD_NONE = 'none'

exports.getConf = function () {
  const rootPath = process.cwd()
  let appConf = null
  let moduleConf = null
  let buildType = exports.BUILD_NONE

  let appPath = null
  let appConfPath = null
  let modulePath = null
  let moduleConfPath = null
  if (fs.existsSync('app.conf.js')) {
    appPath = rootPath
    appConfPath = path.join(appPath, 'app.conf.js')
  }

  if (fs.existsSync('mod.conf.js')) {
    modulePath = rootPath
    moduleConfPath = path.join(modulePath, 'mod.conf.js')
  }

  if (appConfPath && fs.existsSync(appConfPath)) {
    appConf = require(appConfPath)
    buildType = exports.BUILD_APP
  } else if (moduleConfPath && fs.existsSync(moduleConfPath)) {
    moduleConf = require(moduleConfPath)
    appPath = path.resolve(modulePath, '..')
    appConfPath = path.join(appPath, 'app.conf.js')
    appConf = require(appConfPath)
    buildType = exports.BUILD_MODULE
  } else {
    buildType = exports.BUILD_NONE
  }

  return {
    appConf: appConf,
    moduleConf: moduleConf,
    buildType: buildType,
    appPath: appPath,
    modulePath: modulePath
  }
}

exports.createCompiler = function (webpack, config) {
  let compiler
  try {
    compiler = webpack(config)
  } catch (err) {
    console.log(chalk.red('Failed to compile.'))
    console.log()
    console.log(err.message || err)
    console.log()
    process.exit(1)
  }
  return compiler
}

exports.prepareUrls = function (protocol, host, port) {
  const formatUrl = hostname =>
    url.format({
      protocol,
      hostname,
      port,
      pathname: '/'
    })

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  let prettyHost, lanUrlForConfig, lanUrlForTerminal
  if (isUnspecifiedHost) {
    prettyHost = 'localhost'
    try {
      lanUrlForConfig = getLocalIp()
      if (lanUrlForConfig) {
        if (isPrivate(lanUrlForConfig)) {
          lanUrlForTerminal = formatUrl(lanUrlForConfig)
        } else {
          lanUrlForConfig = undefined
        }
      }
    } catch (err) { }
  } else {
    prettyHost = host
  }
  const localUrlForTerminal = formatUrl(prettyHost)
  const localUrlForBrowser = formatUrl(prettyHost)
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser
  }
}
