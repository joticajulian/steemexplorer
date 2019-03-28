<template>
  <footer class="footer bg-primary text-light">
    <div class="container-fluid">
      <div class="row pt-2 pb-2">
        <div class="col-6 text-left"><small>Pulsar version {{version}}</small></div>
        <div class="col-6 text-right"><small>Supported by Utopian <a href="https://utopian.io/" target="_blank"><img src="../assets/logo-utopian-white.png" style="height: 20px;"/></a></small></div>
      </div>
    </div>
  </footer>
</template>

<script>
import Config from '@/config.js'

export default {
  name: 'FooterEFTG',
  data() {
    return {
      version: Config.APP_VERSION.substring(7)
    }
  },

  created() {
    var debug = true
    if(debug){
      console.log('RPC NODE: '+this.$store.state.rpc_node)
    }
  }
} 
</script>

<style>

</style>