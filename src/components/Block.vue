<template>
  <div class="block">
    <div v-if="this.exists">
      <div class="info0">
        <h1>Block {{$route.params.id}}</h1>
      </div>
      <div class="info1">
        <h2>Block info</h2>
        <card-data :data="this.blockGenerals"></card-data>
      </div
      ><div class="info2">
        <h2>{{block.transactions.length}} Transactions</h2>
        <div v-for="(tx,key,index) in block.transactions">
          <trx :tx="tx"></trx>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="loader"></div>
    </div>        
  </div>
</template>

<script>
import CardData from '@/components/CardData'
import Trx from '@/components/Trx'

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
    CardData,
    Trx
  },
  
  created() {
    this.fetchData()
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    
    fetchData() {
      var blocknum = this.$route.params.id;
            
      console.log('Fetching data for block '+blocknum);
      var self = this;
      steem.api.getBlock(blocknum, function (err, result) {      
        if (err || !result) {
          console.log(err, result);
          //Update UI
          return;
        }
        
        for(var i=0;i<result.transactions.length;i++){
          if(!result.transactions[i].transaction_id){
            result.transactions[i].transaction_id = result.transaction_ids[i];            
          }
        }
        
        self.block = result;
        
        var no_keys = ['extensions','transaction_ids','transactions'];
        
        var blk = {};
        for(var key in self.block){
          if(no_keys.indexOf(key) >= 0) continue;
          blk[key] = self.block[key];
        }
        
        self.blockGenerals = blk;
        self.exists = true;       
      });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
