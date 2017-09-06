const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const execSync = require('child_process').execSync

/**
 * get user dir
 */
exports.homedir = (function () {
  let homedir = null
  const env = process.env
  const home = env.HOME
  const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME
  if (process.platform === 'win32') {
    homedir = env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || null
  } else if (process.platform === 'darwin') {
    homedir = home || (user ? `/Users/${user}` : null)
  } else if (process.platform === 'linux') {
    homedir = home || (process.getuid() === 0 ? '/root' : (user ? `/home/${user}` : null))
  }
  return typeof os.homedir === 'function' ? os.homedir : function () {
    return homedir
  }
})()

exports.getRootPath = function () {
  return path.resolve(__dirname, '../../')
}

/**
 * get athena cache base root
 */
exports.getAthenaPath = function () {
  const athenaPath = path.join(exports.homedir(), '.athena2')
  if (!fs.existsSync(athenaPath)) {
    fs.mkdirSync(athenaPath)
  }
  return athenaPath
}

/**
 * set athena config
 */
exports.setConfig = function (config) {
  const athenaPath = exports.getAthenaPath()
  if (typeof config === 'object') {
    const oldConfig = exports.getConfig()
    config = Object.assign({}, oldConfig, config)
    fs.writeFileSync(path.join(athenaPath, 'config.json'), JSON.stringify(config, null, 2))
  }
}

/**
 * get athena config
 */
exports.getConfig = function () {
  const configPath = path.join(exports.getAthenaPath(), 'config.json')
  if (fs.existsSync(configPath)) {
    return require(configPath)
  }
  return {}
}

exports.getSystemUsername = function () {
  const userHome = exports.homedir()
  const systemUsername = process.env.USER || path.basename(userHome)
  return systemUsername
}

exports.getAthenaVersion = function () {
  return require(path.join(exports.getRootPath(), 'package.json')).version
}

exports.printAthenaVersion = function () {
  const athenaVersion = exports.getAthenaVersion()
  console.log(`Version ${athenaVersion}`)
  console.log()
}

exports.shouldUseYarn = function () {
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

exports.shouldUseCnpm = function () {
  try {
    execSync('cnpm --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}
