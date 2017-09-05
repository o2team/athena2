const path = require('path')
const fs = require('fs-extra')
const memFs = require('mem-fs')
const editor = require('mem-fs-editor')

const {
  getConfig,
  getSystemUsername,
  getRootPath
} = require('../util')

class CreateBase {
  constructor () {
    const store = memFs.create()
    this.fs = editor.create(store)
    this.username = getConfig().username || getSystemUsername()
    this.sourceRoot(path.join(getRootPath()))
    this.init()
  }

  init () {}

  sourceRoot (rootPath) {
    if (typeof rootPath === 'string') {
      this._rootPath = path.resolve(rootPath)
    }
    if (!fs.existsSync(this._rootPath)) {
      fs.ensureDirSync(this._rootPath)
    }
    return this._rootPath
  }

  templatePath () {
    let filepath = path.join.apply(path, arguments)
    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this._rootPath, 'templates', filepath)
    }
    return filepath
  }

  destinationRoot (rootPath) {
    if (typeof rootPath === 'string') {
      this._destinationRoot = path.resolve(rootPath)
      if (!fs.existsSync(rootPath)) {
        fs.ensureDirSync(rootPath)
      }
      process.chdir(rootPath)
    }
    return this._destinationRoot || process.cwd()
  }

  destinationPath () {
    let filepath = path.join.apply(path, arguments)
    if (!path.isAbsolute(filepath)) {
      filepath = path.join(this.destinationRoot(), filepath)
    }
    return filepath
  }

  template (type, source, dest, data, options) {
    if (typeof dest !== 'string') {
      options = data
      data = dest
      dest = source
    }
    this.fs.copyTpl(
      this.templatePath(type, source),
      this.destinationPath(dest),
      data || this,
      options
    )
    return this
  }

  copy (type, source, dest) {
    dest = dest || source
    this.template(type, source, dest)
    return this
  }

  write () {}
}

module.exports = CreateBase
