const fs = require('fs')
const path = require('path')
const FTPS = require('ftps')
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
  createConnect(publish)
}

function createConnect (opts) {
  const ftps = new FTPS(opts)
  ftps.exec(function (err, res) {
    console.log(err);
  });
}
