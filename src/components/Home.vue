<template>
  <div>
    <HeaderEFTG :showAuth="false" ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center mb-4">My portfolio</h2>
      <AuthComponent ref="auth" v-on:login="onLogin"></AuthComponent>
    </div>            
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'
import AuthComponent from '@/components/Auth'

export default {
  name: "Home",
  
  components: {
    HeaderEFTG,
    AuthComponent
  }
} 
</script>

<style>
.no-a{
  color: #2c3e50;
}
.no-a:hover{
  text-decoration: none;
  color: #0F5494;
}
</style>
