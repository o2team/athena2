const path = require('path')
const url = require('url')
const fs = require('fs-extra')
const chalk = require('chalk')

const { getLocalIp, isPrivate } = require('../util')

exports.BUILD_MODULE = 'module'
exports.BUILD_APP = 'app'
exports.BUILD_NONE = 'none'

exports.DEFAULT_PROTOCOL = 'http'
exports.DEFAULT_HOST = '0.0.0.0'
exports.DEFAULT_PORT = 3000
exports.DEFAULT_BUILD_ROOT = 'dist'
exports.DEFAULT_PUBLIC_PATH = '/'
exports.DEFAULT_STATIC_DIRECTORY = 'static'
exports.DEFAULT_CHUNK_DIRECTORY = 'chunk'

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

exports.getAppBuildConfig = function (appPath) {
  return require(path.join(appPath, 'config'))
}

exports.getEntry = function ({ appConf, appPath, moduleList = [], buildConfig = {} }) {
  if (!moduleList.length) {
    moduleList = appConf.moduleList
  }
  const entry = {}
  const sourceRoot = buildConfig.sourceRoot
  moduleList.forEach(mod => {
    const pagePath = path.join(appPath, sourceRoot, mod, 'page')
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

exports.getPageHtml = function ({ appConf, appPath, moduleList = [], buildConfig = {} }) {
  if (!moduleList.length) {
    moduleList = appConf.moduleList
  }
  const pageHtml = {}
  const sourceRoot = buildConfig.sourceRoot
  moduleList.forEach(mod => {
    const pagePath = path.join(appPath, sourceRoot, mod, 'page')
    const pageDirInfo = fs.readdirSync(pagePath)
    if (!pageHtml[mod]) {
      pageHtml[mod] = {}
    }
    pageDirInfo.forEach(item => {
      const ext = path.extname(item)
      if (!ext.length) {
        let filename = `${item}.html`
        let pageHtmlPath = path.join(pagePath, item, filename)
        if (!fs.existsSync(pageHtmlPath)) {
          filename = `index.html`
          pageHtmlPath = path.join(pagePath, item, filename)
        }
        let title = ''
        try {
          const htmlContents = String(fs.readFileSync(pageHtmlPath))
          const matchs = htmlContents.match(/<title[^>]*>([^<]+)<\/title>/)
          if (matchs) {
            title = matchs[1]
          }
        } catch (e) {
          title = ''
        }
        pageHtml[mod][item] = {
          filepath: pageHtmlPath,
          filename,
          title
        }
      }
    })
  })
  return pageHtml
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
