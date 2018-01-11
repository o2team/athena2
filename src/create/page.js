const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')

const CreateBase = require('./base')

class Page extends CreateBase {
  constructor (options) {
    super()
    this.conf = Object.assign({
      appName: null,
      template: null,
      framework: null,
      pageName: null,
      description: ''
    }, options)
  }

  init () {
    console.log(chalk.green(`Allo ${chalk.green.bold(this.username)}! Prepare to create a new page!`))
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
    if (typeof conf.pageName !== 'string') {
      prompts.push({
        type: 'input',
        name: 'pageName',
        message: 'Please give me a page name!',
        validate (input) {
          if (!input) {
            return 'Page\'s name can not be empty!'
          }
          if (fs.existsSync(`page/${input}`) || fs.existsSync(`src/view/${input}`)) {
            return 'The page already exist, please give me another name!'
          }
          return true
        }
      })
    } else if (fs.existsSync(`page/${conf.pageName}`) || fs.existsSync(`src/view/${conf.pageName}`)) {
      prompts.push({
        type: 'input',
        name: 'pageName',
        message: 'The page already exist, please give me another name!',
        validate (input) {
          if (!input) {
            return 'Page\'s name can not be empty!'
          }
          if (fs.existsSync(`page/${input}`) || fs.existsSync(`src/view/${input}`)) {
            return 'You type the page name repeatedly!'
          }
          return true
        }
      })
    }

    if (typeof conf.description !== 'string') {
      prompts.push({
        type: 'input',
        name: 'description',
        message: 'Please tell me this page\'s description!'
      })
    }

    return inquirer.prompt(prompts)
  }

  write () {
    const { template } = this.conf

    const templateCreate = require(path.join(this.templatePath(), template, 'index.js'))
    templateCreate.page(this, this.conf)
  }
}

module.exports = Page
