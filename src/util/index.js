const os = require('os')
const path = require('path')
const fs = require('fs-extra')

/**
 * get user dir
 */
const homedir = function () {
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

/**
 * get athena cache base root
 */
function getAthenaPath () {
  const athenaPath = path.join(homedir(), '.athena2')
  if (!fs.existsSync(athenaPath)) {
    fs.mkdirSync(athenaPath)
  }
  return athenaPath
}

/**
 * set athena config
 */
function setConfig (config) {
  const athenaPath = this.getAthenaPath()
  if (typeof config === 'object') {
    fs.writeFileSync(path.join(athenaPath, 'config.json'), JSON.stringify(config, null, 2))
  }
}

/**
 * get athena config
 */
function getConfig () {
  const configPath = path.join(getAthenaPath(), 'config.json')
  if (fs.existsSync(configPath)) {
    return require(configPath)
  }
  return {}
}

module.exports = {
  homedir,
  getAthenaPath,
  setConfig,
  getConfig
}
