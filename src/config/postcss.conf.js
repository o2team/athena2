const _ = require('lodash')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-plugin-px2rem')
const assets = require('postcss-assets')
const sprites = require('postcss-sprites')

const browserList = require('./browser_list')
const { isEmptyObject } = require('../util')

const NODE_ENV = process.env.NODE_ENV || ''

const plugins = []

exports.getPostcssPlugins = function (buildConfig = {}, platform = 'pc') {
  const useModuleConf = buildConfig.module || {}
  const customPostcssConf = useModuleConf.postcss || {}
  const customPlugins = customPostcssConf.plugins || []
  plugins.push(require('postcss-flexbugs-fixes'))
  const defaultAutoprefixerConf = {
    browsers: browserList[platform],
    flexbox: 'no-2009'
  }

  const customPostcssAssets = customPostcssConf.assets || {}
  if (customPostcssAssets.enable) {
    plugins.push(assets(_.merge({
      loadPaths: ['src/img/'],
      cache: true
    }, customPostcssConf.assets)))
  }

  const customAutoprefixerConf = customPostcssConf.autoprefixer || {}
  if (isEmptyObject(customAutoprefixerConf) || customAutoprefixerConf.enable) {
    plugins.push(autoprefixer(_.merge({}, defaultAutoprefixerConf, customAutoprefixerConf)))
  }

  const customPxtoremConf = customPostcssConf.pxtorem || {}
  if (customPxtoremConf.enable) {
    let preConf = {}
    if (buildConfig.designLayoutWidth && buildConfig.baseSize) {
      preConf = {
        rootValue: buildConfig.designLayoutWidth / buildConfig.baseSize
      }
    }
    plugins.push(pxtorem(_.merge(preConf, customPxtoremConf)))
  }

  const customSpritesConf = customPostcssConf.sprites || {}
  if (customSpritesConf.enable) {
    const preSpritesConf = {
      stylesheetPath: 'src/css/',
      spritePath: 'src/img/',
      retina: true,
      relativeTo: 'rule',
      spritesmith: {
        algorithm: 'left-right',
        padding: 2
      },
      verbose: false,
      // 将 img 目录下的子目录作为分组，子目录下的 png 图片会合成雪碧图
      groupBy: function (image) {
        var reg = /img\/(\S+)\/\S+\.png$/.exec(image.url)
        var groupName = reg ? reg[1] : reg
        return groupName ? Promise.resolve(groupName) : Promise.reject()
      },
      // 非 img 子目录下面的 png 不合
      filterBy: function (image) {
        return /img\/\S+\/\S+\.png$/.test(image.url) ? Promise.resolve() : Promise.reject()
      }
    }
    plugins.push(sprites(_.merge(preSpritesConf, customSpritesConf)))
  }

  return plugins.concat(customPlugins)
}
