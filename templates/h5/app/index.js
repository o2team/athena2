const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const shelljs = require('shelljs')
const ora = require('ora')
const uuid = require('uuid')
const download = require('git-clone')

module.exports = function create (creater, params, helper, cb) {
  // download template
  params.h5 = params.h5 ? params.h5 : 'base'
  const dirIsExist = fs.existsSync(path.join(creater.rootPath, 'templates/h5/app', params.h5))
  if (dirIsExist) {
    copyFiles(creater, params, helper, cb)
  } else {
    downloadTemplate(creater, params, helper, cb)
  }
}

function downloadTemplate (creater, params, helper, cb) {
  const { h5 } = params
  const template = h5
  const downloadSpinner = ora(`Downloading h5 template ${template}`).start()
  const from = 'git@git.jd.com:o2h5/h5-templates.git'
  const to = path.join(creater.rootPath, 'templates/h5/app', template)
  download(from, to, {checkout: template}, function (err) {
    downloadSpinner.stop()
    if (err) {
      console.log('')
      console.log('  Failed to download repo ' + chalk.red(from) + ': ' + err.message.trim())
      console.log('')
    } else {
      console.log('')
      console.log('  Base on ' + chalk.green(template) + ' init project success')
      console.log('')

      // copyFiles
      copyFiles(creater, params, helper, cb)
    }
  })
}

function copyFiles (creater, params, helper, cb) {
  const { appName, appId, description, template, date, platform, h5 } = params
  const sourceRootDir = 'src'
  const configDir = 'config'
  const configDirPath = path.join(appName, configDir)
  const sourceRootPath = path.join(appName, sourceRootDir)
  // create app dir
  fs.mkdirpSync(appName)
  fs.mkdirpSync(sourceRootPath)

  allFilesPath(path.join(creater.rootPath, `templates/h5/app/${h5}`), (err, results) => {
    if (err) throw err
    results.forEach(item => {
      let itemPath = item.split(path.sep)
      let fileRootPath = itemPath[itemPath.length - 2]
      let fileName = path.basename(item)
      if (fileRootPath === h5) {
        creater.template(template, `app/${h5}/`, fileName, path.join(sourceRootPath, fileName), { appName })
      } else {
        if (fileRootPath === 'config') {
          if (!fs.existsSync(path.join(appName, fileRootPath))) {
            fs.mkdirpSync(path.join(appName, fileRootPath))
          }
          creater.template(template, `app/${h5}/${fileRootPath}`, fileName, path.join(appName, fileRootPath, fileName))
        } else {
          if (!fs.existsSync(path.join(sourceRootPath, fileRootPath))) {
            fs.mkdirpSync(path.join(sourceRootPath, fileRootPath))
          }
          creater.template(template, `app/${h5}/${fileRootPath}`, fileName, path.join(sourceRootPath, fileRootPath, fileName))
        }
      }
    })

    creater.template(template, 'app', 'editorconfig', path.join(appName, '.editorconfig'))
    creater.template(template, 'app', 'gitignore', path.join(appName, '.gitignore'))

    creater.template(template, 'app', 'packagejson', path.join(appName, 'package.json'), {
      appName,
      h5,
      date,
      description
    })
    creater.template(template, 'app', 'app-conf', path.join(appName, 'app.conf.js'), {
      appName,
      appId,
      platform,
      description,
      template,
      h5,
      date
    })

    creater.fs.commit(() => {
      console.log()
      const gitInitSpinner = ora(`cd ${chalk.cyan.bold(appName)}, executing ${chalk.cyan.bold('git init')}`).start()
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
      if (helper.shouldUseYarn()) {
        command = 'yarn install'
      } else if (helper.shouldUseCnpm()) {
        command = 'cnpm install'
      } else {
        command = 'npm install'
      }
      const installSpinner = ora(`Executing ${chalk.cyan.bold(command)}, it will take some time...`).start()
      const install = shelljs.exec(command, { silent: true })
      if (install.code === 0) {
        installSpinner.color = 'green'
        installSpinner.succeed('Install success')
        console.log(`${install.stderr}${install.stdout}`)
      } else {
        installSpinner.color = 'red'
        installSpinner.fail(chalk.red('Install dependencies failed! Please cd in the app directory install yourself!'))
        console.log(`${install.stderr}${install.stdout}`)
      }
      console.log(chalk.green(`Create app ${chalk.green.bold(appName)} Successfully!`))
      console.log(chalk.green(`Please cd ${chalk.green.bold(appName)} and start to work!😝`))
      if (typeof cb === 'function') {
        cb()
      }
    })

  })
}

function allFilesPath (dir, done) {
  let results = []
  fs.readdir(dir, (err, list) => {
    if (err) return done(err)
    var pending = list.length
    if (!pending) return done(null, results)
    list.forEach((file) => {
      file = path.resolve(dir, file)
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory() && !/.git|node_modules|cache/i.test(file)) {
          allFilesPath(file, (err, res) => {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          if (!/.DS_Store|.git|template.conf.js/i.test(file)) results.push(file)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}
