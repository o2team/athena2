const fs = require('fs-extra')
const chalk = require('chalk')
const inquirer = require('inquirer')

const CreateBase = require('./base')

class App extends CreateBase {
  constructor (options) {
    super()
    this.conf = Object.assign({
      appName: null,
      description: '',
      sass: false
    }, options)
  }

  init () {
    console.log(chalk.green(`Allo ${chalk.green.bold(this.username)}! Prepare to create app!`))
    console.log()
  }

  create () {
    this.ask()
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
            return 'App name can not be empty or non-existent!'
          }
          if (fs.existsSync(input)) {
            return 'Already have a same name app in current directory, choose another name please!'
          }
          return true
        }
      })
    } else if (fs.existsSync(conf.appName)) {
      prompts.push({
        type: 'input',
        name: 'appName',
        message: 'Already have a same name app in current directory, choose another name please!',
        validate (input) {
          if (!input) {
            return 'App name can not be empty or non-existent!'
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

    if (!this.username) {
      prompts.push({
        type: 'input',
        name: 'author',
        message: '雁过留声，人过留名~~'
      })
    }

    if (conf.sass === undefined) {
      prompts.push({
        type: 'confirm',
        name: 'useSass',
        message: 'Do you wanna use sass?',
        default: true
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
        name: 'templateName',
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
        return
      }
    }

    return inquirer.prompt(prompts)
  }

  write () {

  }
}

module.exports = App
