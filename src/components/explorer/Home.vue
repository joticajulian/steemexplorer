<template>
  <div class="home">
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>     
    <div class="container">
    <h1>EFTG Explorer</h1>
    <div class="row">
    <div class="col-md-3">
      <div v-if="this.exists.globals">
        <div class="card">
          <div class="title">Current supply</div><br
          >{{this.chainprops.current_supply}}<br
          >{{this.chainprops.current_sbd_supply}}<br
          ><hr>virtual {{this.chainprops.virtual_supply}}
        </div>
        <div class="card">
          <div class="title">Inflation</div><br
          >Annual rate: {{this.chainprops.current_inflation_rate}}<br
          >({{this.chainprops.new_steem_per_day}} per day)
        </div>
        <div class="card">
          <div class="title">Stake</div><br
          >Fund: {{this.chainprops.total_vesting_fund_steem}}<br
          >({{this.chainprops.sp_percent.toFixed(2)}}% of virtual sup.)<br
          >Shares: {{this.chainprops.total_vesting_shares}}<br
          ><hr
          >{{this.chainprops.steem_per_mvests.toFixed(3)}} {{this.STEEM_SYMBOL}} per m{{this.VESTS_SYMBOL}}          
        </div>      
        <div class="card"> 
          <div class="title">{{this.SBD_SYMBOL}}</div><br
          >{{this.chainprops.current_sbd_supply}}<br
          >(<span :class="{
              green: 100*this.sbd_percent<=this.STEEM_SBD_START_PERCENT,
              orange: 100*this.sbd_percent>this.STEEM_SBD_START_PERCENT && 100*this.sbd_percent<this.STEEM_SBD_STOP_PERCENT,
              red: 100*this.sbd_percent>=this.STEEM_SBD_STOP_PERCENT
              }">{{this.sbd_percent.toFixed(2)}}%</span
            > of virtual sup.)<br
          >Print rate: {{this.chainprops.sbd_print_rate/100}}%<br
          >Interest rate: {{this.chainprops.sbd_interest_rate/100}}%
        </div>
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>      
      <div v-if="this.exists.globals && this.exists.reward">  
        <div class="card">
          <div class="title">Reward fund</div><br
          >{{this.chainprops.reward_balance}}<br
          >({{this.reward_percent.toFixed(2)}}% of virtual sup.)<br
          >for next 15 days<br
          ><hr
          >{{this.chainprops.reward_balance_day}} per day<br
          >vote of {{this.vote_value_1000_sp.toFixed(3)}} per 1000 {{this.SP_SYMBOL}}
        </div>
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>      
    </div
    ><div class="col-md-9">
      <div v-if="lastBlocks.length > 0">
        <div class="last-blocks">
          <h2>Last Blocks</h2>      
          <transition-group name="list-blocks" tag="div" class="block-group">
            <div v-for="(b,key,index) in lastBlocks" :key="b.block_num" class="list-blocks-item">
              <div class="block-left">
                <router-link :to="EXPLORER+'b/'+b.block_num">{{b.block_num}}</router-link>
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
                <span class="small">witness</span><br><router-link :to="EXPLORER+'@'+b.witness">{{b.witness}}</router-link>
              </div>
            </div>
          </transition-group>
        </div>
        <div class="schedule">
          <h2>Schedule</h2>
          <transition-group name="list-schedule" tag="div">
            <div v-for="(wit,key,index) in schedule" :key="wit" class="list-schedule-item">
              {{wit}}
            </div>
          </transition-group>
        </div>
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>
    </div>
    </div>
    <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
    <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
    <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>
  </div>
</template>

<script>
import { Client, PrivateKey } from 'eftg-dsteem'
import SteemClient from '@/mixins/SteemClient.js'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import CardData from '@/components/explorer/CardData'
import Trx from '@/components/explorer/Trx'
import HeaderEFTG from "@/components/HeaderEFTG"
import ChainProperties from '@/mixins/ChainProperties.js'

export default {
  name: 'Home',
  data () {
    return {
      chainprops: {
        current_sbd_supply: '0.000',
        virtual_supply: '0.001',
        reward_balance: '0.000',
        reward_balance_day: '0.000',
        recent_claims: 1,
        steem_per_rshare: 0,
        feed_price: 0,
        reward_percent: 0,
        steem_per_mvests: 0,
        vote_value_1000_sp: 0
      },
      lastTxs:[
      ],
      lastBlocks:[
      ],
      schedule:[
      ],
      exists: {
        globals: false,
        reward: false,
      },
      ints: {},
      first_time: true,
      last_block_num: 0,
      EXPLORER: Config.EXPLORER,
    }
  },
  
  components: {
    CardData,
    Trx,
    HeaderEFTG
  },
  
  mixins: [
    ChainProperties,
    SteemClient
  ],
  
  created() {
    this.getChainProperties().then( ()=> {
      this.getDynamicGlobalProperties();
      this.ints.globalprops = setInterval(this.getDynamicGlobalProperties, 12000);
      this.ints.blocks = setInterval(this.fetchBlocks, 3000);
    })
  },
  
  beforeDestroy() {
    clearInterval(this.ints.globalprops);
    clearInterval(this.ints.blocks);
  },
  
  computed: {
    sbd_percent: function(){
      return parseFloat(this.chainprops.current_sbd_supply) / this.chainprops.feed_price * 100 / parseFloat(this.chainprops.virtual_supply);      
    },    
    sbd_per_rshare: function(){
      return this.chainprops.steem_per_rshare * this.chainprops.feed_price;
    },
    reward_percent: function(){
      return parseFloat(this.chainprops.reward_balance) * 100 / parseFloat(this.chainprops.virtual_supply);
    },
    vote_value_1000_sp: function(){
      return (1/50)*1000*this.chainprops.steem_per_rshare*1e12 / this.chainprops.steem_per_mvests * this.chainprops.feed_price;
    }
  },

  methods: {
  
    async getDynamicGlobalProperties() {
      var self = this;
      //var result = await this.client.database.call('get_reward_fund',['post'])
      var result = await this.steem_database_call('get_reward_fund',['post'])
      
      this.chainprops.reward_balance = result.reward_balance;
      this.chainprops.recent_claims = result.recent_claims;
      this.chainprops.reward_balance_day = (parseFloat(this.chainprops.reward_balance)/15).toFixed(3) + ' ' + Config.STEEM;        
      this.chainprops.steem_per_rshare = parseFloat(this.chainprops.reward_balance) / parseInt(this.chainprops.recent_claims);
        
      this.exists.reward = true;
      
      //var result = await this.client.database.getState('')
      var result = await this.steem_database_call('get_state',[''])
      //var result = await this.client.database.call('get_witness_schedule')
      
      //DYNAMIC GLOBAL PROPERTIES
      var keys = ['current_supply', 'current_sbd_supply', 'virtual_supply', 'total_vesting_fund_steem', 'total_vesting_shares', 'pending_rewarded_vesting_shares', 'pending_rewarded_vesting_steem', 'sbd_interest_rate', 'sbd_print_rate', 'maximum_block_size'];
        
      for(var key in result.props){
        if(keys.indexOf(key) < 0) continue;
        this.chainprops[key] = result.props[key];
      }
      this.chainprops.steem_per_mvests = parseFloat(this.chainprops.total_vesting_fund_steem)*1000000/parseFloat(this.chainprops.total_vesting_shares);
        
      var current_inflation_rate = Utils.getInflationRate(result.props.head_block_number)
      this.chainprops.current_inflation_rate = current_inflation_rate/100 + '%'
      this.chainprops.new_steem_per_day = (Config.STEEM_BLOCKS_PER_DAY * parseFloat(this.chainprops.virtual_supply) * (current_inflation_rate / 10000) / Config.STEEM_BLOCKS_PER_YEAR ).toFixed(3) + ' ' + Config.STEEM;
      this.chainprops.sp_percent = parseFloat(this.chainprops.total_vesting_fund_steem) * 100 / parseFloat(this.chainprops.virtual_supply);    
      this.chainprops.feed_price = parseFloat(result.feed_price.base)/parseFloat(result.feed_price.quote);
         
      this.exists.globals = true;
        
      if(this.first_time) this.last_block_num = result.props.head_block_number;
      this.first_time = false; 
        
        
      // SCHEDULE
      if(self.schedule.length == 0){
          self.schedule = result.witness_schedule.current_shuffled_witnesses;
          return;
        }
        var current_witness = '';
        if(self.lastBlocks.length > 0) current_witness = self.lastBlocks[0].witness;
        var round = result.witness_schedule.current_shuffled_witnesses;
        var id = round.indexOf(current_witness);
        if(id == -1) return;
        for(var i=id+1;i<round.length;i++){
          self.$set(self.schedule, i-id-1, round[i]);
        }
        for(var i=0;i<id;i++){
          self.$set(self.schedule, round.length-id-1+i, round[i]);
        }
        self.$set(self.schedule, round.length-1, round[id]);
      
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
          
        //self.client.database.getBlock(num).then(function(resultBlock){
        self.steem_database_call('get_block',[num]).then(function(resultBlock){
          b.size_txs = resultBlock.transactions.length;
          b.size_posts = resultBlock.transactions.filter(function(tx){
            return tx.operations[0][0]=='comment' && tx.operations[0][1].parent_author=='';
          }).length;
          b.timestamp_milis = (new Date(resultBlock.timestamp+'Z')).getTime();
          b.witness = resultBlock.witness;
          b.loaded = true;
          var pos = self.lastBlocks.findIndex(function(blk){return blk.block_num == num});
          if(pos >= 0){
            self.$set(self.lastBlocks, pos, b);
            if(pos == 0 && b.witness == self.schedule[0]) self.schedule.shift()
          }
        });  
      });       
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.last-blocks{
  width: calc(100% - 8rem - 60px);
  display: inline-block;
  vertical-align: top;
}

.schedule{
  width: 8rem;
  display: inline-block;
  vertical-align: top;
  margin-left: 10px;
}

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

.card{
  display: block;
  text-align: right;
  font-family: monospace;
  font-size: 1.2rem;
  background-color: white;
  border: solid 1px #dcdcdc;
  padding: 8px 10px;
  border-radius: 5px;
  margin: 10px auto;
}

.title{
  font-weight: bold;
  font-size: 1.3rem;
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

.list-blocks-enter, .list-blocks-leave-to{
  opacity: 0;  
}

.list-schedule-item {
  transition: all 1s;
  border: solid 1px #dcdcdc;
  border-radius: 5px;
  margin: 3px auto;
  padding: 3px 5px;
  display: block;
  background-color: white;
}

.list-schedule-enter{
  opacity: 0;
}

.list-schedule-leave-to{
  opacity: 0;  
  transform: translateX(-8rem);
}

.list-schedule-leave-active {
  position: absolute;
}

.green{
  color: green;
}

.orange{
  color: orange;
}

.red{
  color: red;
}

</style>
