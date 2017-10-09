var _ = require('lodash')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')

module.exports = function create (creater, params, helper, cb) {
  const { appName, template, framework, componentName, description, date, sass } = params
  // create component dir
  const componentDir = 'src/component'
  const componentCss = sass ? `${componentName}.scss` : `${componentName}.css`

  fs.mkdirpSync(path.join(componentDir, componentName))

  // copy files
  if (framework !== 'vue') {
    creater.template(template, `component/${framework}`, 'component.js', path.join(componentDir, componentName, `${componentName}.js`), {
      date,
      description,
      componentName
    })
    creater.template(template, `component`, 'component.css', path.join(componentDir, componentName, componentCss))
  } else {
    creater.template(template, 'component/vue', 'component.vue', path.join(componentDir, componentName, `${componentName}.vue`), {
      componentName,
      sass
    })
  }

  creater.fs.commit(() => {
    console.log()
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created component: ${chalk.grey.bold(componentName)}`)}`)
    console.log(`${chalk.green('✔ ')}${chalk.grey(`Created directory: ${componentDir}/${componentName}`)}`)
    if (framework !== 'vue') {
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${componentDir}/${componentName}/${componentName}.js`)}`)
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${componentDir}/${componentName}/${componentCss}`)}`)
    } else {
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${componentDir}/${componentName}/${componentName}.vue`)}`)
    }
    console.log()
    console.log(chalk.green(`Create component ${chalk.green.bold(componentName)} Successfully!`))
    if (typeof cb === 'function') {
      cb()
    }
  })
}
