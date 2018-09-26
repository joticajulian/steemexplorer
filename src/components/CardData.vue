<template>
  <div class="account">
    <div class="title">{{title}}</div>
    <div class="data" v-for="(item,key,index) in data">
      <div class="row">
        <div class="key">
          {{key}}
        </div
        ><div class="value">
          {{item}}
        </div>        
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'card-data',
  props: {
    data:{
      type: Object,
      required: true
    },
    title:{
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.title{
  display: block;
  width: 100%;
  background-color: #256ca5;
  font-weight: bold;
  color: white;
  padding: 13px 10px;
}
.row{
  display: block;
  width: 100%;
  border: solid 1px #8a8a8a;
  border-top-width: 0px;
  background-color: #e8e8e8;
  font-family: monospace;  
}
.key{
  display: inline-block;
  width: 30%;
  color: #777777;
  vertical-align: top;
  padding: 10px 10px;
}
.value{
  display: inline-block;
  width: 70%;
  background-color: white;
  padding: 10px 10px;
  
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
