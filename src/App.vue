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
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 0.8rem;  
}

#app .container{
  padding: 14px;
  max-width: 5000px;
}

#app .navbar{
  padding: 0 14px;
  background-color: #0F5494 !important;
  margin-bottom: 2rem;  
}

#app .navbar a{
  border-bottom: 3px solid #0F5494;
  color: white;  
}

#app .navbar a:hover{
  background-color: #003675;
  color: #ffeb3b;
  border-bottom: 3px solid #ffeb3b;  
}

#app .col-form-label{
  font-size: 12px;
  color: #AEAEAE;
}

#app .btn{
  text-transform: uppercase;
  border: none;
  padding: 8px;
  font-size: 0.8rem;  
}

#app .btn-large{
  width: 9rem;
}

#app .btn-primary {
  background-color: #0F5494;
}

#app .btn-primary:hover {
  background-color: #003675;
}

#app .btn-secondary {
  background-color:#C3C3C3; 
}

#app .btn-secondary:hover {
  background-color:#A1A1A1; 
}

#app .btn-secondary:not(:disabled):not(.disabled).active {
  background-color:#0f5494; 
}

@media (min-width: 1200px) {

  #app .container{
    padding-left: 10%;
    padding-right: 10%;
  }
  
  #app .navbar{
    padding-left: 10%;
    padding-right: 10%;
  }

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

</style>
