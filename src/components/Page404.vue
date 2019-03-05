<template>
  <div>
    <HeaderEFTG :showAuth="false" ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h1 class="text-center mb-4">404</h1>
      <h3 class="test-center">Page not found</h3>
    </div>            
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'Page404',
  
  components: {
    HeaderEFTG
  }
} 
</script>
