const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')

module.exports = function create (creater, params, helper, cb) {
  const { appName, appId, description, framework, template, date, platform, sass } = params
  const commonDir = 'common'
  const sourceRootDir = 'src'
  const configDir = 'config'
  const configDirPath = path.join(appName, configDir)
  const sourceRootPath = path.join(appName, sourceRootDir)
  // create app dir
  fs.mkdirpSync(appName)
  fs.mkdirpSync(sourceRootPath)
  fs.mkdirpSync(configDirPath)
  fs.mkdirpSync(path.join(sourceRootPath, commonDir))
  fs.mkdirpSync(path.join(sourceRootPath, commonDir, 'page'))
  fs.mkdirpSync(path.join(sourceRootPath, commonDir, 'component'))

  // copy files
  creater.template(template, 'app', path.join(configDir, 'index'), path.join(configDirPath, 'index.js'))
  creater.template(template, 'app', path.join(configDir, 'dev'), path.join(configDirPath, 'dev.js'))
  creater.template(template, 'app', path.join(configDir, 'prod'), path.join(configDirPath, 'prod.js'))
  creater.template(template, 'module', 'mod-conf', path.join(sourceRootPath, commonDir, 'mod.conf.js'), {
    moduleName: commonDir,
    moduleId: uuid.v1(),
    date,
    appName,
    description: 'common module',
    common: commonDir
  })
  creater.template(template, 'app', 'editorconfig', path.join(appName, '.editorconfig'))
  creater.template(template, 'app', 'gitignore', path.join(appName, '.gitignore'))
  creater.template(template, 'app', 'eslintconfig', path.join(appName, '.eslintrc.js'), {
    appName,
    framework,
    date
  })
  creater.template(template, 'app', 'packagejson', path.join(appName, 'package.json'), {
    appName,
    framework,
    date
  })
  creater.template(template, 'app', 'app-conf', path.join(appName, 'app.conf.js'), {
    appName,
    appId,
    platform,
    description,
    framework,
    template,
    date,
    sass
  })
  creater.template(template, 'app', 'jsconfigjson', path.join(appName, 'jsconfig.json'))
  creater.fs.commit(() => {
    console.log()
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created app: ${chalk.grey.bold(appName)}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${appName}/${configDir}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${appName}/${commonDir}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${appName}/${commonDir}/page`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${appName}/${commonDir}/component`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/${configDir}/index.js`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/${configDir}/dev.js`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/${configDir}/prod.js`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/${commonDir}/mod.conf.js`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.editorconfig`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.gitignore`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.eslintrc.js`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/package.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/jsconfig.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/app.conf.js`)}`)
    console.log()
    const gitInitSpinner = ora(`cd ${chalk.cyan.bold(appName)}, executing ${chalk.cyan.bold('git init')}`).start()
    process.chdir(appName)
    const gitInit = shelljs.exec('git init', { silent: true })
    if (gitInit.code === 0) {
      gitInitSpinner.color = 'green'
      gitInitSpinner.succeed(gitInit.stdout)
    } else {
      gitInitSpinner.color = 'red'
      gitInitSpinner.fail(gitInit.stderr)
    }
    // install
    let command
    if (helper.shouldUseYarn()) {
      command = 'yarn install'
    } else if (helper.shouldUseCnpm()) {
      command = 'cnpm install'
    } else {
      command = 'npm install'
    }
    const installSpinner = ora(`Executing ${chalk.cyan.bold(command)}, it will take some time...`).start()
    const install = shelljs.exec(command, { silent: true })
    if (install.code === 0) {
      installSpinner.color = 'green'
      installSpinner.succeed('Install success')
      console.log(`${install.stderr}${install.stdout}`)
    } else {
      installSpinner.color = 'red'
      installSpinner.fail(chalk.red('Install dependencies failed! Please cd in the app directory install yourself!'))
      console.log(`${install.stderr}${install.stdout}`)
    }
    console.log(chalk.green(`Create app ${chalk.green.bold(appName)} Successfully!`))
    console.log(chalk.green(`Please cd ${chalk.green.bold(appName)} and start to work!😝`))
    if (typeof cb === 'function') {
      cb()
    }
  })
}
