const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')

const CreateBase = require('./base')

class Component extends CreateBase {
  constructor (options) {
    super()
    this.conf = Object.assign({
      appName: null,
      template: null,
      framework: null,
      componentName: null,
      description: ''
    }, options)
  }

  init () {
    console.log(chalk.green(`Allo ${chalk.green.bold(this.username)}! Prepare to create a new component!`))
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
    if (typeof conf.componentName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'componentName',
        message: 'Please give me a component name!',
        validate (input) {
          if (!input) {
            return 'component\'s name can not be empty!'
          }
          if (fs.existsSync(`component/${input}`) || fs.existsSync(`src/component/${input}`) || fs.existsSync(`src/js/${input}.js`)) {
            return 'The component already exist, please give me another name!'
          }
          return true
        }
      })
    } else if (fs.existsSync(`component/${conf.componentName}`) ||
      fs.existsSync(`src/component/${conf.componentName}`) ||
      fs.existsSync(`src/js/${conf.componentName}.js`)) {
      prompts.push({
        type: 'input',
        name: 'componentName',
        message: 'The component already exist, please give me another name!',
        validate (input) {
          if (!input) {
            return 'component\'s name can not be empty!'
          }
          if (fs.existsSync(`component/${input}`) ||
            fs.existsSync(`src/component/${input}`) ||
            fs.existsSync(`src/js/${input}.js`)) {
            return 'You type the component name repeatedly!'
          }
          return true
        }
      })
    }

    if (typeof conf.description !== 'string') {
      prompts.push({
        type: 'input',
        name: 'description',
        message: 'Please tell me this component\'s description!'
      })
    }

    return inquirer.prompt(prompts)
  }

  write () {
    const { template } = this.conf

    const templateCreate = require(path.join(this.templatePath(), template, 'index.js'))
    templateCreate.component(this, this.conf)
  }
}

module.exports = Component
