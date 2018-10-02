<template>
  <div class="block">
    <h1>Block {{$route.params.id}}</h1>
    <div class="info1">
      <h2>Block info</h2>
      <card-data :data="this.blockGenerals"></card-data>
    </div
    ><div class="info2">
      <h2>{{block.transactions.length}} Transactions</h2>
      <div v-for="(tx,key,index) in block.transactions">
        <transaction :tx="tx"></transaction>
      </div>
    </div>    
  </div>
</template>

<script>
import Utils from '@/js/utils.js'
import CardData from '@/components/CardData'
import Transaction from '@/components/Transaction'

export default {
  name: 'Block',
  data () {
    return {
      block: {
      },
      blockGenerals:{
      },
    }
  },
  
  components: {
    CardData,
    Transaction
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
        self.block = result;
        
        var no_keys = ['extensions','transaction_ids','transactions'];
        
        var blk = {};
        for(var key in self.block){
          if(no_keys.indexOf(key) >= 0) continue;
          blk[key] = self.block[key];
        }
        
        self.blockGenerals = blk;        
      });
      
      steem.api.getBlockHeader(blocknum, function(err, result) {
        console.log(err, result);
      });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.info1{
  display: block;
  margin: 15px 50px;
}

.info2{
  display: block;
  margin: 15px 50px;
}

@media only screen and (min-width: 768px) {
  .info1{
    display: inline-block;
    width: 18rem;
    vertical-align: top;
    margin: 15px 10px 15px 50px;    
  }

  .info2{
    display: inline-block;
    width: calc(100% - 18rem - 120px);
    vertical-align: top;
    margin: 15px 50px 15px 10px;
  }
}
</style>
