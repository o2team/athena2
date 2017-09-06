const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const shelljs = require('shelljs')
const ora = require('ora')

const CreateBase = require('./base')

const {
  shouldUseYarn,
  shouldUseCnpm
} = require('../util')

class App extends CreateBase {
  constructor (options) {
    super()
    this.conf = Object.assign({
      appName: null,
      description: '',
      framework: null,
      sass: false
    }, options)
  }

  init () {
    console.log(chalk.green(`Allo ${chalk.green.bold(this.username)}! Prepare to create app!`))
    console.log('Need help? Go and open issue: https://github.com/o2team/athena2/issues/new')
    console.log()
  }

  create () {
    this.ask()
      .then(answers => {
        const date = new Date()
        this.conf = Object.assign(this.conf, answers)
        this.conf.date = date.getFullYear() + '-' + date.getMonth() + 1 + '-' + date.getDate()
        this.write()
      })
  }

  ask () {
    const prompts = []
    const conf = this.conf
    if (typeof conf.appName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'appName',
        message: 'Please give me an app name!',
        validate (input) {
          if (!input) {
            return 'App name can not be empty!'
          }
          if (fs.existsSync(input)) {
            return 'Already existing the app name, choose another name please!'
          }
          return true
        }
      })
    } else if (fs.existsSync(conf.appName)) {
      prompts.push({
        type: 'input',
        name: 'appName',
        message: 'Already existing the app name, choose another name please!',
        validate (input) {
          if (!input) {
            return 'App name can not be empty!'
          }
          if (fs.existsSync(input)) {
            return 'The app name is still repeated!'
          }
          return true
        }
      })
    }

    if (typeof conf.description !== 'string') {
      prompts.push({
        type: 'input',
        name: 'appDescription',
        message: 'Please tell me your app\'s description!'
      })
    }

    const templateChoices = [{
      name: 'Complete(Complex project should use this template)',
      value: 'complete'
    }, {
      name: 'Simple(Simple template for simple project)',
      value: 'simple'
    }]

    if (typeof conf.template !== 'string') {
      prompts.push({
        type: 'list',
        name: 'template',
        message: 'Please choose your favorite template',
        choices: templateChoices
      })
    } else {
      let isTemplateExist = false
      templateChoices.forEach(item => {
        if (item.value === conf.template) {
          isTemplateExist = true
        }
      })
      if (!isTemplateExist) {
        console.log(chalk.red('The template you choose is not exist!'))
        console.log(chalk.red('Currently there are the following templates to choose from:'))
        console.log()
        templateChoices.forEach(item => {
          console.log(chalk.green(`- ${item.name}`))
        })
        process.exit(1)
      }
    }

    if (conf.sass === undefined) {
      prompts.push({
        type: 'confirm',
        name: 'sass',
        message: 'Do you wanna use sass?',
        default: true
      })
    }

    const frameworkChoices = [{
      name: 'Nerv',
      value: 'nerv'
    }, {
      name: 'React',
      value: 'react'
    }, {
      name: 'Vue',
      value: 'vue'
    }]

    if (typeof conf.framework !== 'string') {
      prompts.push({
        type: 'list',
        name: 'framework',
        message: 'Please choose your favorite framework',
        choices: frameworkChoices
      })
    } else {
      let isFrameworkExist = false
      frameworkChoices.forEach(item => {
        if (item.value === conf.framework) {
          isFrameworkExist = true
        }
      })
      if (!isFrameworkExist) {
        console.log(chalk.red('The framework you choose is not exist!'))
        console.log(chalk.red('Currently there are the following frameworks to choose from:'))
        console.log()
        frameworkChoices.forEach(item => {
          console.log(chalk.green(`- ${item.name}`))
        })
        process.exit(1)
      }
    }

    return inquirer.prompt(prompts)
  }

  write () {
    const { appName, description, framework, sass, template, date } = this.conf
    // create app dir
    fs.mkdirpSync(appName)

    // copy files
    this.template(template, 'app', 'editorconfig', path.join(appName, '.editorconfig'))
    this.template(template, 'app', 'gitignore', path.join(appName, '.gitignore'))
    this.template(template, 'app', 'eslintconfig', path.join(appName, '.eslintrc.js'), {
      appName,
      framework,
      date
    })
    this.template(template, 'app', 'packagejson', path.join(appName, 'package.json'), {
      appName,
      framework,
      date
    })
    this.fs.commit(() => {
      console.log()
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created app directory: ${chalk.grey.bold(appName)}`)}`)
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.editorconfig`)}`)
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.gitignore`)}`)
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/.eslintrc.js`)}`)
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${appName}/package.json`)}`)
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
    })
  }
}

module.exports = App
