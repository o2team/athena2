const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')

const CreateBase = require('./base')

class Module extends CreateBase {
  constructor (options) {
    super()
    this.conf = Object.assign({
      appName: null,
      template: null,
      moduleName: null,
      description: ''
    }, options)
  }

  init () {
    console.log(chalk.green(`Allo ${chalk.green.bold(this.username)}! Prepare to create a new module!`))
    console.log('Need help? Go and open issue: https://github.com/o2team/athena2/issues/new')
    console.log()
  }

  create () {
    this.ask()
      .then(answers => {
        const date = new Date()
        this.conf = Object.assign(this.conf, answers)
        this.conf.date = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
        this.write()
      })
  }

  ask () {
    const prompts = []
    const conf = this.conf
    if (typeof conf.moduleName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: 'Please give me a module name!',
        validate (input) {
          if (!input) {
            return 'Module name can not be empty!'
          }
          if (fs.existsSync(`src/${input}`)) {
            return 'The module already exist, please give me another name!'
          }
          return true
        }
      })
    } else if (fs.existsSync(`src/${conf.moduleName}`)) {
      prompts.push({
        type: 'input',
        name: 'moduleName',
        message: 'The module already exist, please give me another name!',
        validate (input) {
          if (!input) {
            return 'Module name can not be empty!'
          }
          if (fs.existsSync(`src/${input}`)) {
            return 'You type the module name repeatedly!'
          }
          return true
        }
      })
    }

    if (typeof conf.description !== 'string') {
      prompts.push({
        type: 'input',
        name: 'description',
        message: 'Please tell me this module\'s description!'
      })
    }

    return inquirer.prompt(prompts)
  }

  write () {
    const { template } = this.conf

    const templateCreate = require(path.join(this.templatePath(), template, 'index.js'))
    templateCreate.module(this, this.conf)
  }
}

module.exports = Module
