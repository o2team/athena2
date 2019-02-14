/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */
import Nerv from 'nervjs'
import '<% if (sass) { %>./<%= componentName %>.scss<% } else { %><%= componentName %>.css<%}%>'

export interface Props {
  something?: any
}

class <%= _.upperFirst(_.camelCase(componentName)) %> extends Nerv.Component<Props, Object> {
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
