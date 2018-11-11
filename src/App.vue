<template>
  <div id="app">
    <!--<img src="./assets/logo.png">
    <router-link :to="{ name: 'HelloWorld' }">Home</router-link>-->
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

.center {
  text-align: center;
}

.right{
  text-align: right;
}

.info0{
  display: block;
  margin: 15px 50px;
}

.info1{
  display: block;
  margin: 15px 50px;
}

.info2{
  display: block;
  margin: 15px 50px;
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

.loader {
  margin: 20px auto;
  border: 3px solid #f3f3f3;  
  border-radius: 50%;
  border-top: 3px solid #72b4e8;
  border-right: 3px solid #72b4e8;
  width: 2rem;
  height: 2rem;
  -webkit-animation: spin 0.7s linear infinite; /* Safari */
  animation: spin 0.7s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media only screen and (min-width: 768px) {
  .info1{
    display: inline-block;
    width: 18rem;
    vertical-align: top;
    margin: 15px 10px 15px 50px;    
  }

  .info2{
    display: inline-block;
    width: calc(100% - 18rem - 120px);
    vertical-align: top;
    margin: 15px 50px 15px 10px;
  }
}

</style>
