/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */
import * as React from 'react'
import '<% if (sass) { %>./<%= componentName %>.scss<% } else { %><%= componentName %>.css<%}%>'

export interface Props {
}

class <%= _.upperFirst(_.camelCase(componentName)) %> extends React.Component<Props, Object> {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className= '<%= componentName %>' >
      </div>
    )
  }
}

export default <%= _.upperFirst(_.camelCase(conf.componentName)) %>
