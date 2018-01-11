const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')

module.exports = function create (creater, params, helper, cb) {
  const { appName, template, componentName, description, date } = params
  // create module dir
  const sourceRootDir = 'src'
  const jsDir = 'js'

  const appConf = require(creater.appConfPath)
  const appConfFile = fs.readFileSync(creater.appConfPath)

  if (!fs.existsSync(path.join(sourceRootDir, jsDir))) {
    fs.mkdirpSync(path.join(sourceRootDir, jsDir))
  }

  // copy files
  creater.template(template, 'component', 'component.js', path.join(sourceRootDir, jsDir, `${componentName}.js`), {
    componentName: componentName,
    date,
    description,
  })

  creater.fs.commit(() => {
    console.log()
    console.log(chalk.green(`Create component ${chalk.green.bold(componentName)} Successfully!`))
    if (typeof cb === 'function') {
      cb()
    }
  })
}
