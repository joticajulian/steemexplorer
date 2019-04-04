<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <Map></Map>    
      <div class="row">
        <div class="col-12">
          <h2 class="mt-3">What is a witness</h2>
          <p>A witness is a node in the network (a server) that produces and seals 'blocks' and add them to the blockchain. These blocks contain information about the documents, reports, and user data. The witnesses are selected by approval voting.</p>
        </div>
      </div>
    </div>    
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'
import Map from '@/components/Map'

export default {
  name: 'MapPage',
  
  components: {
    HeaderEFTG,
    Map
  }
}
</script>
