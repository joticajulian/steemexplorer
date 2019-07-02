<template>
  <div class="block">
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>     
    <div class="container">
    <div v-if="this.exists">
      <div class="row">
        <div class="col-md-12">
          <h1>Block {{$route.params.id}}</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <h2>Block info</h2>
          <card-data :data="this.blockGenerals"></card-data>
        </div
        ><div class="col-md-9">
          <h2>{{block.transactions.length}} Transactions</h2>
          <div v-for="(tx,key,index) in block.transactions">
            <trx :tx="tx"></trx>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="loader"></div>
    </div>
    <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
    <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
    <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>        
  </div>
</template>

<script>
import { Client } from 'eftg-dsteem'
import SteemClient from '@/mixins/SteemClient.js'
import Config from '@/config.js'

import CardData from '@/components/explorer/CardData'
import Trx from '@/components/explorer/Trx'

import HeaderEFTG from '@/components/HeaderEFTG'
import ChainProperties from '@/mixins/ChainProperties.js'

export default {
  name: 'Block',
  data () {
    return {
      block: {
      },
      blockGenerals:{
      },
      exists: false,
    }
  },
  
  components: {
    HeaderEFTG,
    CardData,
    Trx
  },
  
  mixins: [
    ChainProperties,
    SteemClient
  ], 
  
  created() {
    this.getChainProperties().then( ()=> {
      this.fetchData()
    })
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    
    async fetchData() {
      var blocknum = this.$route.params.id;
            
      console.log('Fetching data for block '+blocknum);
      
      //var result = await this.client.database.getBlock(blocknum)
      var result = await this.steem_database_call('get_block',[blocknum])
        
      for(var i=0;i<result.transactions.length;i++){
        if(!result.transactions[i].transaction_id){
          result.transactions[i].transaction_id = result.transaction_ids[i];            
        }
          
        if(!result.transactions[i].block_num){
          result.transactions[i].block_num = blocknum;
        }
      }
        
      this.block = result;
        
      var no_keys = ['extensions','transaction_ids','transactions'];
        
      var blk = {};
      for(var key in this.block){
        if(no_keys.indexOf(key) >= 0) continue;
        blk[key] = this.block[key];
      }
        
      this.blockGenerals = blk;
      this.exists = true;      
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
