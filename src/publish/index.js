// const fs = require('fs')
const path = require('path')
const FTPS = require('ftps')
const ora = require('ora')
const chalk = require('chalk')

/*
  获取配置项
*/
const {
  getConf,
  getAppBuildConfig
} = require('../build')

module.exports = function publish () {
  const conf = getConf()
  const buildConfig = getAppBuildConfig(conf.appPath)
  const { publish } = buildConfig
  createConnect(publish, conf.appPath, buildConfig.outputRoot)
}

function createConnect (opts, appPath, outputRoot) {
  try {
    const ftps = new FTPS(opts)
    const localDir = path.join(appPath, outputRoot)

    const deploySpinner = ora(`Starting deploy, it will take some time...`).start()

    ftps.mirror({
      localDir,
      remoteDir: opts.path,
      parallel: true,
      upload: true
    }).exec((err, res) => {
      if (!err && !res.error) {
        deploySpinner.color = 'green'
        deploySpinner.succeed('Deploy Successfully!')
      } else {
        deploySpinner.color = 'red'
        deploySpinner.fail(chalk.red('Deploy Failed😢'))
        console.log(chalk.red(`${err || res.error}`))
      }
    })
  } catch (e) {
    console.log(`${e}`)
  }
}
