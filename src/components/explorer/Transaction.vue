<template>
  <div class="transaction">
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>     
    <div class="container">
    <div v-if="this.exists">
      <div class="row">
        <h1 class="col-12">Transaction</h1>
        <h2 class="col-12">{{$route.params.tx}}</h2>
        <h3 class="col-12">(Block <router-link :to="'/explorer/b/'+$route.params.id">{{$route.params.id}}</router-link>)</h3>
        <trx :tx="tx" class="col-12"></trx>
        <h2 class="col-12">Raw</h2>
        <card-data :data="tx"></card-data>
      </div>
    </div>  
    <div v-else>
      <div class="loader"></div>
    </div>
    </div>
  </div>
</template>

<script>
import { Client } from 'eftg-dsteem'
import Config from '@/config.js'

import CardData from '@/components/explorer/CardData'
import Trx from '@/components/explorer/Trx'

import HeaderEFTG from '@/components/HeaderEFTG'
import ChainProperties from '@/mixins/ChainProperties.js'

export default {
  name: 'Transaction',
  data () {
    return {
      client: null,
      block: {
      },
      tx:{        
      },
      exists: false
    }
  },
  
  components: {
    HeaderEFTG,
    CardData,
    Trx
  },
  
  mixins: [
    ChainProperties
  ],
  
  created() {
    this.client = new Client(Config.RPC_NODE.url);
    this.fetchData()
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    
    async fetchData() {
      var blocknum = this.$route.params.id;
            
      console.log('Fetching data for block '+blocknum);
      
      var result = await this.client.database.getBlock(blocknum)      
        
      for(var i=0;i<result.transactions.length;i++){
        if(!result.transactions[i].transaction_id){
          result.transactions[i].transaction_id = result.transaction_ids[i];            
        }
      }
        
      this.block = result;
      var index = this.block.transaction_ids.indexOf(this.$route.params.tx);        
      if(index >= 0){
        this.tx = this.block.transactions[index]
        this.tx.block_num = blocknum
      } else {
        this.tx = {};          
      }
      this.exists = true;      
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
