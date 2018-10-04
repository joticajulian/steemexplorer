<template>
  <div class="account">
    <div class="title" v-if="title!=''">{{title}}</div>
    <div class="row line"></div>
    <div class="data" v-for="(item,key,index) in data">
      <div class="row">
        <div :class="{
          key: true,
          keyO: (typeof data === 'object' && typeCard==''),
          keyA: Array.isArray(data)  && typeCard=='',
          keyA2: typeCard=='witnesses'}">
          {{key}}
        </div
        ><div :class="{
          value: true,
          valueO: (typeof data === 'object' && typeCard==''),
          valueA: Array.isArray(data)  && typeCard=='',
          valueA2: typeCard=='witnesses'}">        
          <div v-if="typeof item === 'object'">
            <div v-if="link==true && item.link">
              <a :href="item.link">{{item.text}}</a>
            </div>
            <div v-else>
              <card-data :data="item"></card-data>
            </div>
          </div>
          <div v-else>            
            {{item}}            
          </div>
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
      type: [Object,Array],
      required: true
    },
    title:{
      type: String,
      required: false,
      default: ''
    },
    typeCard:{
      type: String,
      required: false,
      default: ''
    },
    link:{
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>

<style scoped>
.account{
  margin: 10px auto;
}

.title{
  display: block;
  width: 100%;
  background-color: #72b4e8;
  font-weight: bold;
  color: white;
  border: solid 1px #8a8a8a;
  padding: 8px 10px;
}

.line{
  height: 1px;
  line-height: 1px;
  overflow: hidden;
}

.row{
  display: block;
  width: 100%;
  border: solid 1px #dcdcdc;
  border-top-width: 0px;
  background-color: white;
  font-family: monospace;  
}
.key{
  display: inline-block;
  color: #a0a0a0;
  vertical-align: top;
  padding: 8px 10px;
  
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

.value{
  display: inline-block;
  background-color: white;
  padding: 8px 10px;
  
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

.keyO{
  width: 8rem;  
}

.keyA{
  width: 2rem; 
}

.keyA2{
  width: 3rem; 
}

.valueO{
  width: calc(100% - 8rem);
}

.valueA{
  width: calc(100% - 2rem);
}

.valueA2{
  width: calc(100% - 3rem);
}

@media only screen and (min-width: 768px) {
}
</style>
