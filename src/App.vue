<template>
  <div id="app">
    <img src="./assets/logo.png">
    <router-link :to="{ name: 'HelloWorld' }">Home</router-link>
    <div class="global">
      
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import CardData from '@/components/CardData'

export default {
  name: 'App',
  
  components: {
    CardData
  }
}
</script>

<style>
*{
  box-sizing: border-box;
}

body{
  background-color: #f3f3f3;
  margin: 0px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.break-word{
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
}

</style>
