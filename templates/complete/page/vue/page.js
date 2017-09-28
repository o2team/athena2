/**
 * @author <%= username %>
 * @date <%= date %>
 * @desc <%= description %>
 */

import Vue from 'vue'
import View from './<%= pageName %>'

new Vue({
  render: h => h(View)
}).$mount('#J_container')
