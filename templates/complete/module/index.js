const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')

module.exports = function create (creater, params, helper, cb) {
  const { appName, template, moduleName, description, date } = params
  // create module dir
  const sourceRootDir = 'src'
  const pageDir = 'page'
  const componentDir = 'component'
  const commonDir =  'common'
  const appConf = require(creater.appConfPath)
  const appConfFile = fs.readFileSync(creater.appConfPath)
  const appConfStr = String(appConfFile)
  let appConfStrLines = appConfStr.split('\n')
  let moduleList = appConf.moduleList

  if (moduleList.indexOf(moduleName) < 0) {
    for (var i = 0; i < appConfStrLines.length; i++) {
      var line = appConfStrLines[i];
      if (line.indexOf('moduleList') >= 0) {
        appConfStrLines[i] = line.split(']')[0];
        if (moduleList.length > 0) {
          appConfStrLines[i] += ', \'' + moduleName + '\'],';
        } else {
          appConfStrLines[i] += '\'' + moduleName + '\'],';
        }
      }
    }
    fs.writeFileSync(creater.appConfPath, appConfStrLines.join('\n'));
  }

  fs.mkdirpSync(path.join(sourceRootDir, moduleName))
  fs.mkdirpSync(path.join(sourceRootDir, moduleName, pageDir))
  fs.mkdirpSync(path.join(sourceRootDir, moduleName, componentDir))

  // copy files
  creater.template(template, 'module', 'mod-conf', path.join(sourceRootDir, moduleName, 'mod.conf.js'), {
    moduleName: moduleName,
    moduleId: uuid.v1(),
    date,
    appName,
    description,
    common: commonDir
  })

  creater.fs.commit(() => {
    console.log()
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created module: ${chalk.grey.bold(moduleName)}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${appName}/${sourceRootDir}/${moduleName}/${pageDir}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${appName}/${sourceRootDir}/${moduleName}/${componentDir}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/${sourceRootDir}/${moduleName}/mod.conf.js`)}`)
    console.log()
    console.log(chalk.green(`Create module ${chalk.green.bold(moduleName)} Successfully!`))
    if (typeof cb === 'function') {
      cb()
    }
  })
}
