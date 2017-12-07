const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')

module.exports = function create (creater, params, helper, cb) {
  const { appName, appId, description, template, framework, date, platform } = params
  const sourceRootDir = 'src'
  const configDir = 'config'
  const configDirPath = path.join(appName, configDir)
  const sourceRootPath = path.join(appName, sourceRootDir)
  const cssRootPath = path.join(sourceRootPath, 'css')
  const imgRootPath = path.join(sourceRootPath, 'img')
  const jsRootPath = path.join(sourceRootPath, 'js')

  // create app dir
  fs.mkdirpSync(appName)
  fs.mkdirpSync(sourceRootPath)
  fs.mkdirpSync(configDirPath)
  fs.mkdirpSync(cssRootPath)
  fs.mkdirpSync(imgRootPath)
  fs.mkdirpSync(jsRootPath)

  // copy files
  creater.template(template, 'app/base/', 'indexhtml', path.join(sourceRootPath, 'index.html'), { appName })
  creater.template(template, 'app/base/css', 'base.scss', path.join(cssRootPath, 'base.scss'))
  creater.template(template, 'app/base/css', 'loading.scss', path.join(cssRootPath, 'loading.scss'))
  creater.template(template, 'app/base/css', 'main.scss', path.join(cssRootPath, 'main.scss'))
  creater.template(template, 'app/base/css', 'mixin.scss', path.join(cssRootPath, 'mixin.scss'))
  creater.template(template, 'app/base/css', 'package.scss', path.join(cssRootPath, 'package.scss'))
  creater.template(template, 'app/base/img', 'loading.gif', path.join(imgRootPath, 'loading.gif'))
  creater.template(template, 'app/base/js', 'main.js', path.join(jsRootPath, 'main.js'))

  creater.template(template, 'app', path.join(configDir, 'index'), path.join(configDirPath, 'index.js'))
  creater.template(template, 'app', path.join(configDir, 'dev'), path.join(configDirPath, 'dev.js'))
  creater.template(template, 'app', path.join(configDir, 'prod'), path.join(configDirPath, 'prod.js'))

  creater.template(template, 'app', 'editorconfig', path.join(appName, '.editorconfig'))
  creater.template(template, 'app', 'gitignore', path.join(appName, '.gitignore'))
  // creater.template(template, 'app', 'eslintconfig', path.join(appName, '.eslintrc.js'), {
  //   appName,
  //   framework,
  //   date
  // })
  creater.template(template, 'app', 'packagejson', path.join(appName, 'package.json'), {
    appName,
    framework,
    date,
    description
  })
  creater.template(template, 'app', 'app-conf', path.join(appName, 'app.conf.js'), {
    appName,
    appId,
    platform,
    description,
    template,
    framework,
    date
  })

  creater.fs.commit(() => {
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
