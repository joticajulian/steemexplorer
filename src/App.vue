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
</style>
