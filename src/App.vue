<template>
  <div id="nav">
    <router-view/>
  </div>
  <div id="dialog" class="dialog"></div>
</template>

<script>
export default {
  setup () {
  }
}

</script>
<style lang="scss">
body {
  padding: 0;
  margin: 0;
}

#nav {
  height: 100vh;
  background: #F0F8FF;
}
#dialog {
  .el-dialog__body {
    padding: 10px;
  }
}
</style>
