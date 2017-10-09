/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */
import Nerv from 'nervjs'

class <%= _.upperFirst(_.camelCase(componentName)) %> extends Nerv.Component {
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

module.exports = <%= _.upperFirst(_.camelCase(conf.componentName)) %>
