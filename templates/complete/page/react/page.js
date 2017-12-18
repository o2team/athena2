/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */
import React from 'react'
import ReactDom from 'react-dom'

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

ReactDom.render(<<%= _.upperFirst(_.camelCase(pageName)) %> />, document.getElementById('J_container'))
