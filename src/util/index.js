const os = require('os')
const path = require('path')
const fs = require('fs-extra')

/**
 * get user dir
 */
exports.homedir = function () {
  function homedir () {
    const env = process.env
    const home = env.HOME
    const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME
    if (process.platform === 'win32') {
      return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home || null
    }
    if (process.platform === 'darwin') {
      return home || (user ? '/Users/' + user : null)
    }
    if (process.platform === 'linux') {
      return home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : null))
    }
    return home || null
  }
  return typeof os.homedir === 'function' ? os.homedir : homedir
}()

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
  const config = exports.getConfig()
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
