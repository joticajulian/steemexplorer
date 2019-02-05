<template>
  <footer class="footer bg-primary text-light">
    <div class="container-fluid">
      <div class="row pt-2 pb-2">
        <div class="col-12 text-right"><small>EFTG version {{version}}</small></div>
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
  }
} 
</script>

<style>

</style>