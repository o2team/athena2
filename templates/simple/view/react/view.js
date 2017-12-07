/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */
import React from 'react'
import '<% if (sass) { %>./<%= pageName %>.scss<% } else { %><%= pageName %>.css<%}%>'

class <%= _.upperFirst(_.camelCase(pageName)) %> extends React.Component {
  constructor () {
    super(...arguments)
    this.state = {}
  }

  render () {
    return (
      <div className='<%= pageName %>'>
      </div>
    )
  }
}

module.exports = <%= _.upperFirst(_.camelCase(conf.pageName)) %>
