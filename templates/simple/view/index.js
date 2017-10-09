var _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')

module.exports = function create (creater, params, helper, cb) {
  const { appName, template, framework, pageName, description, date, sass } = params
  // create page dir
  const pageDir = 'src/view'
  const pageCss = sass ? `${pageName}.scss` : `${pageName}.css`

  fs.mkdirpSync(path.join(pageDir, pageName))

  // copy files
  if (framework !== 'vue') {
    creater.template(template, `view/${framework}`, 'view.js', path.join(pageDir, pageName, `${pageName}.js`), {
      date,
      description,
      pageName
    })
    creater.template(template, `view`, 'view.css', path.join(pageDir, pageName, pageCss))
  } else {
    creater.template(template, 'view/vue', 'view.vue', path.join(pageDir, pageName, `${pageName}.vue`), {
      pageName,
      sass
    })
  }

  creater.fs.commit(() => {
    console.log()
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created page: ${chalk.grey.bold(pageName)}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${pageDir}/${pageName}`)}`)
    if (framework !== 'vue') {
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${pageDir}/${pageName}/${pageName}.js`)}`)
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${pageDir}/${pageName}/${pageCss}`)}`)
    } else {
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${pageDir}/${pageName}/${pageName}.vue`)}`)
    }
    console.log()
    console.log(chalk.green(`Create page ${chalk.green.bold(pageName)} Successfully!`))
    if (typeof cb === 'function') {
      cb()
    }
  })
}
