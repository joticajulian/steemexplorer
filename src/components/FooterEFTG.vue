<template>
  <footer class="footer bg-primary text-light">
    <div class="container-fluid">
      <div class="row pt-2 pb-2">
        <div class="col-12 col-md-8 text-justify">
          <small>EFTG is a pilot project to explore and test the capabilities of the Blockchain technology for sharing financial data in Europe.</small>     
        </div>
        <div class="col-12 col-md-8 text-justify">
          <small>Materials listed on this portal are provided "as is", without warranty of any kind.</small>          
        </div>
        <div class="col-12 col-md-4 text-right"><small>PULSAR version {{version}}</small></div>
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