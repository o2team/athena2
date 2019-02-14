const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

module.exports = function create (creater, params, helper, cb) {
  const { template, framework, componentName, description, date, sass, typescript } = params
  // create component dir
  const componentDir = 'src/component'
  const componentCss = sass ? `${componentName}.scss` : `${componentName}.css`
  const suffix = typescript ? 'tsx' : 'js'

  fs.mkdirpSync(path.join(componentDir, componentName))

  // copy files
  if (framework !== 'vue') {
    creater.template(template, `component/${framework}`, typescript ? 'component.ts' : 'component.js', path.join(componentDir, componentName, `${componentName}.${suffix}`), {
      date,
      description,
      componentName,
      sass
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
      console.log(`${chalk.green('✔ ')}${chalk.grey(`Created file: ${componentDir}/${componentName}/${componentName}.${suffix}`)}`)
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
