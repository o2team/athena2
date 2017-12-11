const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const uuid = require('uuid')

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
      template: null,
      platform: null,
      sass: false
    }, options)
  }

  init () {
    console.log(chalk.green(`Allo ${chalk.green.bold(this.username)}! Prepare to create a new app!`))
    console.log('Need help? Go and open issue: https://github.com/o2team/athena2/issues/new')
    console.log()
  }

  create () {
    this.ask()
      .then(answers => {
        this.askOther(answers.template)
          .then(otherAnswers => {
            const date = new Date()
            this.conf = Object.assign(this.conf, answers, otherAnswers)
            this.conf.appId = uuid.v1()
            this.conf.date = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
            this.write()
          })
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
        message: 'Already existing the app, choose another name please!',
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
        name: 'description',
        message: 'Please tell me your app\'s description!'
      })
    }

    const platformChoices = [{
      name: 'PC',
      value: 'pc'
    }, {
      name: 'Mobile',
      value: 'mobile'
    }]

    if (typeof conf.template !== 'string') {
      prompts.push({
        type: 'list',
        name: 'platform',
        message: 'Please choose your app platform',
        choices: platformChoices
      })
    } else {
      let isPlatformExist = false
      platformChoices.forEach(item => {
        if (item.value === conf.template) {
          isPlatformExist = true
        }
      })
      if (!isPlatformExist) {
        console.log(chalk.red('The platform you choose is not exist!'))
        console.log(chalk.red('Currently there are the following platforms to choose from:'))
        console.log()
        platformChoices.forEach(item => {
          console.log(chalk.green(`- ${item.name}`))
        })
        process.exit(1)
      }
    }

    const templateChoices = [{
      name: 'Complete(Complex project like multi-page application should use this template)',
      value: 'complete'
    }, {
      name: 'Simple(Simple template like single-page application for simple project)',
      value: 'simple'
    }, {
      name: 'H5(Like Interactive game OR Operational activities)',
      value: 'h5'
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

    return inquirer.prompt(prompts)
  }

  askOther (template) {
    const newPrompts = []
    const conf = this.conf
    if (template === 'h5') {
      conf.framework = 'base'
    } else {
      if (typeof conf.framework !== 'string') {
        newPrompts.push({
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

      if (!conf.sass) {
        newPrompts.push({
          type: 'confirm',
          name: 'sass',
          message: 'Do you wanna use sass?'
        })
      }
    }

    return inquirer.prompt(newPrompts)
  }

  write () {
    const { template } = this.conf

    const templateCreate = require(path.join(this.templatePath(), template, 'index.js'))
    templateCreate.app(this, this.conf, {
      shouldUseYarn,
      shouldUseCnpm
    })
  }
}

module.exports = App
