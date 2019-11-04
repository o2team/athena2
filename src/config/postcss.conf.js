const _ = require('lodash')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-plugin-px2rem')
const assets = require('postcss-assets')
const sprites = require('postcss-sprites')

const browserList = require('./browser_list')
const { isEmptyObject } = require('../util')

const plugins = []

exports.getPostcssPlugins = function (buildConfig = {}, platform = 'pc', template = 'complete') {
  const useModuleConf = buildConfig.module || {}
  const customPostcssConf = useModuleConf.postcss || {}
  const customPlugins = customPostcssConf.plugins || []
  plugins.push(require('postcss-flexbugs-fixes'))
  const defaultAutoprefixerConf = {
    overrideBrowserslist: browserList[platform],
    flexbox: 'no-2009'
  }

  const customPostcssAssets = customPostcssConf.assets || {}
  if (customPostcssAssets.enable) {
    plugins.push(assets(_.merge({
      cache: true
    }, customPostcssConf.assets)))
  }

  const customSpritesConf = customPostcssConf.sprites || {}
  if (customSpritesConf.enable) {
    const spritePath = template === 'h5' ? 'dist/img/' : 'dist/static/images/'
    const preSpritesConf = {
      spritePath: spritePath,
      retina: true,
      relativeTo: 'rule',
      spritesmith: {
        algorithm: 'left-right',
        padding: 2
      },
      verbose: false,
      // 将 img 目录下的子目录作为分组，子目录下的 png 图片会合成雪碧图
      groupBy: function (image) {
        const reg = template === 'h5'
          ? /img\/(\S+)\/\S+\.png$/.exec(image.url)
          : /images\/(\S+)\/\S+\.png$/.exec(image.url)
        const groupName = reg ? reg[1] : reg
        image.ratio = 1
        if (groupName) {
          let ratio = /@(\d+)x$/gi.exec(groupName)
          if (ratio) {
            ratio = ratio[1]
            while (ratio > 10) {
              ratio = ratio / 10
            }
            image.ratio = ratio
          }
        }
        return groupName ? Promise.resolve(groupName) : Promise.reject(new Error(`The image ${image.url} is incorrect.`))
      },
      // 非 img 子目录下面的 png 不合
      filterBy: function (image) {
        const reg = template === 'h5'
          ? /img\/(\S+)\/\S+\.png$/.test(image.url)
          : /images\/(\S+)\/\S+\.png$/.test(image.url)
        return reg ? Promise.resolve() : Promise.reject(new Error(`The image ${image.url} is incorrect.`))
      }
    }
    const updateRule = require('postcss-sprites/lib/core').updateRule
    if (buildConfig.enableREM) {
      preSpritesConf.hooks = {
        onUpdateRule: function (rule, token, image) {
          updateRule(rule, token, image)

          rule.insertAfter(rule.last, postcss.decl({
            prop: 'background-size',
            value: image.spriteWidth / image.ratio + 'px ' + image.spriteHeight / image.ratio + 'px;'
          }))
        }
      }
    }
    plugins.push(sprites(_.merge(preSpritesConf, customSpritesConf)))
  }

  const customAutoprefixerConf = customPostcssConf.autoprefixer || {}
  if (isEmptyObject(customAutoprefixerConf) || customAutoprefixerConf.enable) {
    plugins.push(autoprefixer(_.merge({}, defaultAutoprefixerConf, customAutoprefixerConf)))
  }

  const customPxtoremConf = customPostcssConf.pxtorem || {}
  const addPxtoRem = function () {
    let preConf = {}
    if (buildConfig.designLayoutWidth && buildConfig.baseSize) {
      preConf = {
        rootValue: buildConfig.designLayoutWidth / buildConfig.baseSize
      }
    }
    plugins.push(pxtorem(_.merge(preConf, customPxtoremConf)))
  }
  if (template === 'h5') {
    if (buildConfig.enableREM && customPxtoremConf.enable) addPxtoRem()
  } else {
    if (customPxtoremConf.enable) addPxtoRem()
  }

  return plugins.concat(customPlugins)
}
