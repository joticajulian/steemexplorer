<template>
  <div class="transaction">
    <div v-if="this.exists">
      <div class="info0">
        <h1>Transaction</h1>
        <h2>{{$route.params.tx}}</h2>
        <trx :tx="tx"></trx>
        <h2>Raw</h2>
        <card-data :data="tx"></card-data>
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
  name: 'Transaction',
  data () {
    return {
      block: {
      },
      tx:{        
      },
      exists: false
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
        if (err || !result || result.length == 0) {
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
        var index = self.block.transaction_ids.indexOf(self.$route.params.tx);        
        if(index >= 0) self.tx = self.block.transactions[index];
        else {
          self.tx = {};          
        }
        self.exists = true;
      });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
