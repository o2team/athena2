const _ = require('lodash')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')

const browserList = require('./browser_list')
const { isEmptyObject } = require('../util')

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
  const customAutoprefixerConf = customPostcssConf.autoprefixer || {}
  if (isEmptyObject(customAutoprefixerConf) || customAutoprefixerConf.enable) {
    plugins.push(autoprefixer(_.merge({}, defaultAutoprefixerConf, customAutoprefixerConf)))
  }

  const customPxtoremConf = customPostcssConf.pxtorem || {}
  if (customPxtoremConf.enable) {
    plugins.push(pxtorem(_.merge({}, customPxtoremConf)))
  }

  return plugins.concat(customPlugins)
}
