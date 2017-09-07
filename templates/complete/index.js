const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const {
  shouldUseYarn,
  shouldUseCnpm
} = require('../../src/util')

module.exports = function create (creater, params, cb) {
  const { appName, appId, description, framework, sass, template, date, platform } = params
  // create app dir
  fs.mkdirpSync(appName)

  // copy files
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
    template,
    date
  })
  creater.fs.commit(() => {
    console.log()
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created app directory: ${chalk.grey.bold(appName)}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.editorconfig`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.gitignore`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.eslintrc.js`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/package.json`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/app.conf.js`)}`)
    console.log()
    const gitInitSpinner = ora(`cd ${chalk.cyan.bold(appName)}, executing ${chalk.cyan.bold('git init')}`).start()
    console.log()
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
    if (!shouldUseYarn()) {
      command = 'yarn install'
    } else if (shouldUseCnpm()) {
      command = 'cnpm install'
    } else {
      command = 'npm install'
    }
    const installSpinner = ora(`Executing ${chalk.cyan.bold(command)}, it will take some time...`).start()
    console.log()
    const install = shelljs.exec(command, { silent: true })
    if (install.code === 0) {
      console.log(`${install.stderr}${install.stdout}`)
      installSpinner.color = 'green'
      installSpinner.succeed('Install success')
    } else {
      installSpinner.color = 'red'
      installSpinner.fail(chalk.red('Install dependencies fail!Please cd in the app directory install yourself!'))
    }
    console.log()
    console.log(chalk.green(`Create app ${chalk.green.bold(appName)} Successfully!`))
    console.log(chalk.green(`Please cd ${chalk.green.bold(appName)} and start to work!😝`))
    if (typeof cb === 'function') {
      cb()
    }
  })
}
