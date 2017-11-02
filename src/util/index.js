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
  console.log(`👩  Athena v${athenaVersion}`)
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

function _normalizeFamily (family) {
  return family ? family.toLowerCase() : 'ipv4'
}

exports.getLocalIp = function (name, family) {
  const interfaces = os.networkInterfaces()
  //
  // Default to `ipv4`
  //
  family = _normalizeFamily(family)

  //
  // If a specific network interface has been named,
  // return the address.
  //
  if (name && name !== 'private' && name !== 'public') {
    const res = interfaces[name].filter(details => {
      const itemFamily = details.family.toLowerCase()
      return itemFamily === family
    })
    if (res.length === 0) {
      return undefined
    }
    return res[0].address
  }

  const all = Object.keys(interfaces).map(nic => {
    //
    // Note: name will only be `public` or `private`
    // when this is called.
    //
    const addresses = interfaces[nic].filter(details => {
      details.family = details.family.toLowerCase()
      if (details.family !== family || exports.isLoopback(details.address)) {
        return false
      } else if (!name) {
        return true
      }

      return name === 'public' ? !exports.isPrivate(details.address)
        : exports.isPrivate(details.address)
    })
    return addresses.length ? addresses[0].address : undefined
  }).filter(Boolean)

  return !all.length ? exports.loopback(family) : all[0]
}

exports.loopback = function loopback (family) {
  //
  // Default to `ipv4`
  //
  family = _normalizeFamily(family)

  if (family !== 'ipv4' && family !== 'ipv6') {
    throw new Error('family must be ipv4 or ipv6')
  }

  return family === 'ipv4' ? '127.0.0.1' : 'fe80::1'
}

exports.isLoopback = function isLoopback (addr) {
  return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/
    .test(addr) ||
    /^fe80::1$/.test(addr) ||
    /^::1$/.test(addr) ||
    /^::$/.test(addr)
}

exports.isPrivate = function isPrivate (addr) {
  return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/
    .test(addr) ||
    /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/.test(addr) ||
    /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/
      .test(addr) ||
    /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/.test(addr) ||
    /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/.test(addr) ||
    /^fc00:/i.test(addr) ||
    /^fe80:/i.test(addr) ||
    /^::1$/.test(addr) ||
    /^::$/.test(addr)
}

exports.isPublic = function isPublic (addr) {
  return !exports.isPrivate(addr)
}

exports.zeroPad = function (num, places) {
  const zero = places - num.toString().length + 1
  return Array(+(zero > 0 && zero)).join('0') + num
}

exports.formatTime = function (date) {
  if (!date) {
    date = new Date()
  } else if (!(date instanceof Date)) {
    date = new Date(date)
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${year}-${exports.zeroPad(month, 2)}-${exports.zeroPad(day, 2)} ${exports.zeroPad(hour, 2)}:${exports.zeroPad(minute, 2)}`
}

exports.isEmptyObject = function (obj) {
  if (obj == null) {
    return true
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

exports.urlJoin = function () {
  function normalize(str) {
    return str
      .replace(/([\/]+)/g, '/')
      .replace(/\/\?(?!\?)/g, '?')
      .replace(/\/\#/g, '#')
      .replace(/\:\//g, '://')
  }

  const joined = [].slice.call(arguments, 0).join('/')
  return normalize(joined)
}
