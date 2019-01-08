<template>
  <div id="app"><router-view></router-view></div>
</template>

<script>
//import HelloWorld from "./components/HelloWorld";

export default {
  name: "App",
  mounted() {
    let dsteemscript = document.createElement("script");
    dsteemscript.setAttribute(
      "src",
      "https://unpkg.com/eftg-dsteem@1.0.1/dist/dsteem.js"
    );
    document.head.appendChild(dsteemscript);
  }
};
</script>

<style>
body {
  margin: 0px;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#app .col-form-label{
  font-size: 12px;
  color: #AEAEAE;
}

#app .btn-primary {
  background-color: #0F5494;
}

#app .btn-secondary {
  background-color:#C3C3C3; 
}

#app .btn-secondary:not(:disabled):not(.disabled).active {
  background-color:#0f5494; 
}

</style>
