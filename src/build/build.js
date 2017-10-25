const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ora = require('ora')

const { getRootPath, isEmptyObject } = require('../util')
const formatWebpackMessage = require('../util/format_webpack_message')

const {
  getConf,
  getAppBuildConfig,
  getEntry,
  getPageHtml,
  createCompiler,
  BUILD_APP,
  BUILD_MODULE,
  BUILD_NONE
} = require('./index')

module.exports = function build (args, options) {
  const conf = getConf()
  conf.args = args
  switch (conf.buildType) {
    case BUILD_APP:
      buildApp(conf, options)
      break
    case BUILD_MODULE:
      buildModule(conf, options)
      break
    case BUILD_NONE:
      console.log(chalk.red('✖ Build error, the current directory is not an app or a module!'))
      console.log(chalk.bold('GoodBye!'))
      break
  }
}

function buildCore (conf, options) {
  const buildSpinner = ora(`Starting build, please wait🤡~`).start()
  const appConf = conf.appConf
  const buildConfig = getAppBuildConfig(conf.appPath)
  const {
    publicPath,
    outputRoot,
    chunkDirectory
    // staticDirectory
  } = buildConfig
  conf.buildConfig = buildConfig
  const entry = getEntry(conf)
  if (isEmptyObject(entry)) {
    buildSpinner.fail(chalk.red(`No file to build, please check if the ${chalk.bold('page')} directories are empty!`))
    console.log(chalk.bold('GoodBye!'))
    process.exit(1)
  }
  const { template, framework, platform } = appConf
  const customWebpackConf = buildConfig.webpack
  const webpackBaseConf = require('../config/base.conf')(conf.appPath, buildConfig, template, platform, framework)
  const webpackProdConf = require('../config/prod.conf')(conf.appPath, buildConfig, template, platform, framework)
  const webpackConf = webpackMerge(webpackBaseConf, webpackProdConf, customWebpackConf)
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
  webpackConf.entry = entry
  const contentBase = path.join(conf.appPath, outputRoot)
  webpackConf.output = {
    path: contentBase,
    filename: '[name].js',
    publicPath,
    chunkFilename: `${chunkDirectory}/[name].chunk.js`
  }
  webpackConf.plugins = webpackConf.plugins.concat(htmlPlugins)
  // delete last output
  fs.emptyDirSync(outputRoot)
  const compiler = createCompiler(webpack, webpackConf)
  compiler.run((err, stats) => {
    if (err) {
      return printBuildError(err)
    }
    const { errors, warnings } = formatWebpackMessage(stats.toJson({}, true))
    const isSuccess = !errors.length && !warnings.length
    if (isSuccess) {
      buildSpinner.succeed(chalk.green('Compile successfully!\n'))
    }
    if (errors.length) {
      errors.splice(1)
      buildSpinner.fail(chalk.red('Compile failed!\n'))
      return printBuildError(new Error(errors.join('\n\n')))
    }
    if (warnings.length) {
      if (warnings.length) {
        buildSpinner.warn(chalk.yellow('Compiled with warnings.\n'))
        console.log(warnings.join('\n\n'))
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        )
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        )
      } else {
        buildSpinner.succeed(chalk.green('Compiled successfully.\n'))
      }
    }
  })
}

function printBuildError (err) {
  const message = err != null && err.message
  const stack = err != null && err.stack
  if (stack && typeof message === 'string' && message.indexOf('from UglifyJs') !== -1) {
    try {
      const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack)
      if (!matched) {
        throw new Error('Using errors for control flow is bad.')
      }
      const problemPath = matched[2]
      const line = matched[3]
      const column = matched[4]
      console.log(
        'Failed to minify the code from this file: \n\n',
        chalk.yellow(
          `\t${problemPath}:${line}${column !== '0' ? ':' + column : ''}`
        ),
        '\n'
      )
    } catch (ignored) {
      console.log('Failed to minify the bundle.', err)
    }
    console.log('Read more here: http://bit.ly/2tRViJ9')
  } else {
    console.log((message || err) + '\n')
  }
  console.log()
}

function buildApp (conf, options) {
  conf.moduleList = conf.args
  delete conf.args
  if (!conf.moduleList || !conf.moduleList.length) {
    conf.moduleList = conf.appConf.moduleList
  }
  console.log(`Current building modules ${chalk.bold(conf.moduleList.join(' '))}!`)
  buildCore(conf, options)
}

function buildModule (conf, options) {
  const moduleConf = conf.moduleConf
  conf.moduleList = [moduleConf.module]
  delete conf.args
  console.log(`Current building module ${chalk.bold(conf.moduleList[0])}!`)
  buildCore(conf, options)
}
