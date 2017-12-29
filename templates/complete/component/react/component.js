/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */

import React from 'react'
import ReactDom from 'react-dom'

import '<% if (sass) { %>./<%= componentName %>.scss<% } else { %><%= componentName %>.css<%}%>'

class <%= _.upperFirst(_.camelCase(componentName)) %> extends React.Component {
  constructor () {
    super(...arguments)
    this.state = {}
  }

  render () {
    return (
      <div className='<%= componentName %>'>
      </div>
    )
  }
}

export default <%= _.upperFirst(_.camelCase(conf.componentName)) %>
