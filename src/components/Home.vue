<template>
  <div class="home">      
    <div v-if="this.exists">
      <h1>Steem Explorer</h1>
      <div class="info1">
        <h2>Global props</h2>
        <card-data :data="this.chainprops"></card-data>
      </div
      ><div class="info2">
        <h2>Last Blocks</h2>
        <transition-group name="list-blocks" tag="div" class="block-group">
          <div v-for="(b,key,index) in lastBlocks" :key="b.block_num" class="list-blocks-item">
            <div class="block-left">
              <a :href="'#/b/'+b.block_num">{{b.block_num}}</a>
              <span v-if="b.loaded">
                - {{b.size_txs}} transactions
                <span v-if="b.size_posts>0">
                  ({{b.size_posts}} posts)
                </span>
              </span>
              <span v-else>
                loading...
              </span>
            </div
            ><div class="block-right">
              <span class="small">witness</span><br><a :href="'#/@'+b.witness">{{b.witness}}</a>
            </div>
          </div>
        </transition-group>
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
  name: 'Home',
  data () {
    return {
      chainprops: {
      },
      lastTxs:[
      ],
      lastBlocks:[
      ],
      exists: false,
      ints: {},
      first_time: true,
      last_block_num: 0,
      show: true,
    }
  },
  
  components: {
    CardData,
    Trx
  },
  
  created() {
    this.getDynamicGlobalProperties();
    this.ints.globalprops = setInterval(this.getDynamicGlobalProperties, 12000);
    this.ints.blocks = setInterval(this.fetchBlocks, 3000);
  },
  
  beforeDestroy() {
    clearInterval(this.ints.globalprops);
    clearInterval(this.ints.blocks);
  },

  methods: {
  
    getDynamicGlobalProperties() {
      var self = this;
      steem.api.getDynamicGlobalProperties(function(err, result){
        if (err || !result) {
          console.log(err, result);
          return;
        }
        
        var keys = ['current_supply', 'current_sbd_supply', 'virtual_supply', 'total_vesting_fund_steem', 'total_vesting_shares', 'pending_rewarded_vesting_shares', 'pending_rewarded_vesting_steem', 'sbd_interest_rate', 'sbd_print_rate', 'maximum_block_size'];
        
        var glo = {};
        for(var key in result){
          if(keys.indexOf(key) < 0) continue;
          glo[key] = result[key];
        }
        glo.steem_per_mvests = (parseFloat(glo.total_vesting_fund_steem)*1000000/parseFloat(glo.total_vesting_shares)).toFixed(3);

        
        self.chainprops = glo;
        self.exists = true;
        
        if(self.first_time) self.last_block_num = result.head_block_number;
        self.first_time = false;        
      });
    },
  
    fetchBlocks() {
      if(this.last_block_num == 0) return;      
      
      var SIZE_BLOCKS = 10;
      var last_block_recorded = {}
      if(this.lastBlocks.length > 0){
        last_block_recorded = this.lastBlocks[0];          
      }else{
        last_block_recorded = {
          block_num : this.last_block_num - SIZE_BLOCKS,
          timestamp_milis : (new Date()).getTime(),
          time_ago: '',
          loaded: false,
        }
      }
        
      var n = this.last_block_num - last_block_recorded.block_num;
      var newBlocks = [];
      for(var i=1;i<=n;i++) newBlocks.push(this.last_block_num - n + i);
      this.last_block_num++;
            
      var self = this;
      newBlocks.forEach(function(num){
        var b = {
          block_num : num,
          timestamp_milis : last_block_recorded.timestamp_milis + (num-last_block_recorded.block_num)*3000,
          time_ago: '',
          size_txs: 0,
          size_posts: 0,
          witness: '',
          loaded: false,
        };
          
        self.lastBlocks.unshift(b);
        if(self.lastBlocks.length > SIZE_BLOCKS) self.lastBlocks.pop();
          
        steem.api.getBlock(num, function (err, resultBlock) {      
          if (err || !resultBlock) {
            console.log(err, resultBlock);             
            return;
          }
          b.size_txs = resultBlock.transactions.length;
          b.size_posts = resultBlock.transactions.filter(function(tx){
            return tx.operations[0][0]=='comment' && tx.operations[0][1].parent_author=='';
          }).length;
          b.timestamp_milis = (new Date(resultBlock.timestamp+'Z')).getTime();
          b.witness = resultBlock.witness;
          b.loaded = true;
          var pos = self.lastBlocks.find(function(blk){return blk.block_num == num});
          if(pos >= 0){
            self.$set(self.lastBlocks, pos, b);
          }
        });  
      });
       
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.block-left{
  display: inline-block;
  margin: auto 0px;
  width: 70%;
}

.block-right{
  display: inline-block;
  width: 30%;
  margin: auto 0px;
  text-align: right;
}

.small{
  font-size: 0.8rem;
}

.block-group{
  height: 51rem;
}

.list-blocks-item {
  transition: all 3s;
  border: solid 1px #dcdcdc;
  border-radius: 5px;
  margin: 10px auto;
  padding: 8px 10px;
  display: block;
  background-color: white;
  height: 4rem;
}
/*, .list-blocks-leave-to*/
/*.list-blocks-enter, */
.list-blocks-enter, .list-blocks-leave-to{
  opacity: 0;  
}
/*.list-blocks-leave-active {
  position: absolute;
}*/

</style>
