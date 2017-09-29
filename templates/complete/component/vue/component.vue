<template>
  <div class="<%= componentName %>">

  </div>
</template>

<script>
export default {
  name: '<%= componentName %>',
  data () {
    return {

    }
  }
}
</script>

<style scoped<% if (sass) { %> lang="sass"<% } %>>
</style>
