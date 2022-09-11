<template>
  <div id="app">
    <router-view style="min-height:calc(100vh - 2.5rem);">
    </router-view>
    <FooterEFTG></FooterEFTG>
  </div>
</template>

<script>
import FooterEFTG from "@/components/FooterEFTG";

// import { TimeAgo } from "vue2-timeago";
// import "vue2-timeago/dist/vue2-timeago.css";

export default {
  name: "App",
  components: {
    FooterEFTG,
    // TimeAgo
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Ubuntu&display=swap');

body {
  margin: 0px;  
}

#app {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 1rem;  
}

#app .container{
  padding: 14px;
  max-width: 5000px;
}

#app .navbar{
  padding: 0 14px;
  background-color: #3c6fc7 !important;
  margin-bottom: 1rem;
}

#app .navbar a{
  /* border-bottom: 3px solid #0F5494; */
}

#app .navbar a:hover{
  background-color: #0b47af;  
}

#app .list-group-item:hover{
  background-color: #C3C3C3;  
}

#app .navbar-dark .navbar-nav .nav-link {
    color: white;
}

#app .col-form-label{
  font-size: 12px;
  color: #636363;
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
  background-color: #3c6fc7;
}

#app .btn-primary:hover {
  background-color: #0b47af;
}

#app .btn-secondary {
  background-color:#C3C3C3; 
}

#app .btn-secondary:hover {
  background-color:#A1A1A1; 
}

#app .btn-secondary:not(:disabled):not(.disabled).active {
  background-color:#3c6fc7; 
}

#app .bg-primary {
  background-color: #3c6fc7 !important;
}

#app .bg-secondary {
  background-color:#C3C3C3 !important; 
}

#app .bg-info {
  background-color:#ffe800 !important; 
}

#app .text-primary {
  color: #3c6fc7 !important;
}

#app .text-secondary {
  color: #C3C3C3 !important;
}

#app .table-primary th{
  background-color: #3c6fc7 !important;
  border-color: #3c6fc7 !important;
  color: white !important;
}

.table-primary tr:nth-child(even) {
    background-color: grayscale;
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
  border: 3px solid #ffffff;  
  border-radius: 50%;
  border-top: 3px solid #0b47af;
  border-right: 3px solid #0b47af;
  width: 2rem;
  height: 2rem;
  -webkit-animation: spin 0.7s linear infinite; /* Safari */
  animation: spin 0.7s linear infinite;
}

.mini {
  width: 1rem !important;
  height: 1rem !important;
  display: inline-block;
  margin: 0 5px 0 0;
  vertical-align: text-bottom;
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

.no-a{
  text-decoration: none;
  color: #2c3e50;
}
.no-a:hover{
  text-decoration: none;
  color: #3c6fc7;
}

.image-profile {
  display: inline-block;
  height: 2rem;
  width: 2rem;
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  border-radius: 50%;
  vertical-align: middle;
}

</style>
