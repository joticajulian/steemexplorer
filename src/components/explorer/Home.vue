<template>
  <div class="home">
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>     
    <div class="container">
    <h1>Serey Explorer</h1>
    <div class="row">
    <div class="col-md-3">
      <div v-if="this.exists.globals">
        <div class="card">
          <div class="title">Current supply</div><br
          >{{this.chain.current_supply}}<br
          >{{this.chain.current_sbd_supply}}<br
          ><hr>virtual {{this.chain.virtual_supply}}
        </div>
        <div class="card">
          <div class="title">Serey Price</div><br
          >Witnesses price: ${{this.chain.witnesses_price.toFixed(4)}}<br
          >Haircut: ${{this.chain.haircut_price.toFixed(4)}}<br
          ><hr>
          Feed price: ${{this.chain.feed_price.toFixed(4)}}
        </div>
        <div class="card">
          <div class="title">Inflation</div><br
          >Annual rate: {{this.chain.current_inflation_rate}}<br
          >({{this.chain.new_steem_per_day}} per day)
        </div>
        <div class="card">
          <div class="title">Stake</div><br
          >Fund: {{this.chain.total_vesting_fund_steem}}<br
          >({{this.chain.sp_percent.toFixed(2)}}% of virtual sup.)<br
          >Shares: {{this.chain.total_vesting_shares}}<br
          ><hr
          >{{this.chain.steem_per_mvests.toFixed(3)}} {{this.STEEM_SYMBOL}} per m{{this.VESTS_SYMBOL}}          
        </div>      
        <div class="card"> 
          <div class="title">{{this.SBD_SYMBOL}}</div><br
          >{{this.chain.current_sbd_supply}}<br
          >(<span :class="{
              green: 100*this.chain.sbd_percent<=this.STEEM_SBD_START_PERCENT,
              orange: 100*this.chain.sbd_percent>this.STEEM_SBD_START_PERCENT*0.8 && 100*this.chain.sbd_percent<this.STEEM_SBD_STOP_PERCENT,
              red: 100*this.chain.sbd_percent>=this.STEEM_SBD_STOP_PERCENT*0.8
              }">{{this.chain.sbd_percent.toFixed(2)}}%</span
            > of virtual sup.)<br
          >Print rate: {{this.chain.sbd_print_rate/100}}%<br
          >Interest rate: {{this.chain.sbd_interest_rate/100}}%
        </div>
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>      
      <div v-if="this.exists.globals && this.exists.reward">  
        <div class="card">
          <div class="title">Reward fund</div><br
          >{{this.chain.reward_balance}} {{this.STEEM_SYMBOL}}<br
          >({{this.chain.reward_percent.toFixed(2)}}% of virtual sup.)<br
          >for next 15 days<br
          ><hr
          >{{this.chain.reward_balance_day}} per day<br
          >vote of {{this.chain.vote_value_1000_sp.toFixed(3)}} per 1000 {{this.SP_SYMBOL}}
          <br><hr>
          recent claims {{this.chain.recent_claims}}<br>
          <a href="https://steemit.com/@jga/complete-guide-to-understand-rewards-in-hf21-part-1">gap</a>: {{this.chain.gap.toFixed(3)}} {{this.STEEM_SYMBOL}} ({{this.chain.gap_sbd.toFixed(3)}} {{this.SBD_SYMBOL}})
          <hr>Post payout simulation {{example_post.payout.toFixed(3)}} {{this.SBD_SYMBOL}}
          <br>claims per rshare {{example_post.claims_per_rshare.toFixed(4)}}
          <br><input type="range" min="0" max="500" v-model="example_post.slider" class="slider" id="slider-example-post">
        </div>
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>      
    </div
    ><div class="col-md-9">
      <div class="last-blocks">
        <div v-if="lastBlocks.length > 0">
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
        <div v-else>
          <div class="loader"></div>
        </div>
      </div>
      <div v-if="exists.schedule" class="schedule">
        <h2>Schedule</h2>
        <transition-group name="list-schedule" tag="div">
          <div v-for="(wit,key,index) in schedule" :key="wit" class="list-schedule-item">
            {{wit}}
          </div>
        </transition-group>
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
// import { Client, PrivateKey } from 'eftg-dsteem'
import SteemClient from '@/mixins/SteemClient.js'

const sereyjs = require('@sereynetwork/sereyjs');

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
      lastTxs:[
      ],
      lastBlocks:[
      ],
      schedule:[
      ],
      exists: {
        globals: false,
        reward: false,
        schedule: false,
      },
      ints: {},
      first_time: true,
      last_block_num: 0,
      wait_more_time: false,
      example_post: {
        claims_per_rshare: 0,
        payout: 0
      },
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
    this.chain.feed_price = 0
    this.chain.witnesses_price = 0
    this.chain.haircut_price = 0
    this.chain.sp_percent = 0
    this.chain.steem_per_mvests = 0
    this.chain.sbd_percent = 0
    this.chain.reward_percent = 0
    this.chain.vote_value_1000_sp = 0

    this.getChainProperties(true).then( ()=> {
      this.getExtendedChainProperties();
      
      this.exists.reward = true;
      this.exists.globals = true;
      console.log('no more loader')

      this.getWitnessSchedule()
      // disabled as serey dont have prices
      // this.getWitnessesPrice()

      this.ints.blocks = setInterval(this.fetchBlocks, 3000);
      this.ints.chainprops = setInterval(()=>{
        this.getChainProperties(true)
        .then( ()=>{ 
          this.getExtendedChainProperties()
          this.getWitnessSchedule()
        })
      }, 12000);

      this.handleInputSlider()
    })
  },
  
  beforeDestroy() {
    //clearInterval(this.ints.witschedule);
    clearInterval(this.ints.chainprops);
    clearInterval(this.ints.blocks);
  },
  
  methods: {

    async getWitnessSchedule() {
      sereyjs.api.setOptions({ url: 'wss://api.serey.io' }); // assuming websocket is working at ws.golos.io
      sereyjs.config.set('address_prefix','SRY');

      const witness_schedule = await sereyjs.api.getWitnessScheduleAsync();

      // var witness_schedule = await this.steem_database_call('get_witness_schedule')

      // if(this.first_time) this.last_block_num = tsnumber;
      if(this.first_time) this.last_block_num = this.chain.head_block_number;
      this.first_time = false;
      console.log('last block num: '+this.last_block_num)
      console.log(this.schedule[0]) 
      console.log(this.schedule.length);

      this.exists.schedule = true;

      if(this.schedule.length == 0){
        this.schedule = witness_schedule.current_shuffled_witnesses;
        return;
      }
      var current_witness = '';
      if(this.lastBlocks.length > 0) current_witness = this.lastBlocks[0].witness;
      var round = witness_schedule.current_shuffled_witnesses;
      var id = round.indexOf(current_witness);
      if(id == -1) return;
      for(var i=id+1;i<round.length;i++){
        this.$set(this.schedule, i - id - 1, round[i]);
      }
      for(var j = 0; j < id;j++){
        this.$set(this.schedule, round.length - id - 1 + j, round[j]);
      }
      this.$set(this.schedule, round.length-1, round[id]);
    },

    getExtendedChainProperties() {
      console.log('get extended chain properties')
      var current_inflation_rate = Utils.getInflationRate(this.chain.head_block_number)
      this.chain.current_inflation_rate = current_inflation_rate/100 + '%'
      this.chain.new_steem_per_day = (Config.STEEM_BLOCKS_PER_DAY * parseFloat(this.chain.virtual_supply) * (current_inflation_rate / 10000) / Config.STEEM_BLOCKS_PER_YEAR ).toFixed(3) + ' ' + Config.STEEM;
      this.chain.sp_percent = parseFloat(this.chain.total_vesting_fund_steem) * 100 / parseFloat(this.chain.virtual_supply);
      this.chain.sbd_percent = parseFloat(this.chain.current_sbd_supply) / this.chain.feed_price * 100 / parseFloat(this.chain.virtual_supply);      
      this.chain.sbd_per_rshare = this.chain.steem_per_rshare * this.chain.feed_price;
      this.chain.reward_percent = parseFloat(this.chain.reward_balance) * 100 / parseFloat(this.chain.virtual_supply);
      this.chain.reward_balance_day = (parseFloat(this.chain.reward_balance)/15).toFixed(3) + ' ' + Config.STEEM; 
      this.chain.vote_value_1000_sp = (1/50)*1000*this.chain.steem_per_rshare*1e12 / this.chain.steem_per_mvests * this.chain.feed_price;
    },

    async getWitnessesPrice() {
      console.log('get witnesses price')
      try{
        var feed_history = await this.steem_database_call('get_feed_history')
        var prices = []
        for(var i in feed_history.price_history){
          var price = feed_history.price_history[i]
          prices.push( parseFloat(price.base)/parseFloat(price.quote) )
        }
        console.log(prices)
        this.chain.witnesses_price = prices[ Math.floor(prices.length/2) ]
        console.log(this.chain.witnesses_price)
      }catch(error){
        console.log('getWitnessesPrice error')
        console.log(error)
      }
    },

    isNullExchangeRage(rate){
      if(!rate.base || !rate.quote) return true
      if(parseFloat(rate.base)<=0) return true
      if(parseFloat(rate.quote)<=0) return true
      return false
    },
  
    fetchBlocks() {
      console.log('fecth blocks')
      if(this.last_block_num == 0) return;
      if(this.wait_more_time) {
        this.wait_more_time = false
        return
      }
      
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

        self.getBlock(b)
      })
    },

    getBlock(b) {
      let self = this          
      self.steem_database_call('get_block',[b.block_num]).then(function(resultBlock){
        if(!resultBlock) { //Block still does not exist.
          self.wait_more_time = true
          console.log('Block does not exist yet. Waiting 3 seconds')
          setTimeout( ()=>{ self.getBlock(b) }, 3000)
          return
        }

        b.size_txs = resultBlock.transactions.length;
        b.size_posts = resultBlock.transactions.filter(function(tx){
          return tx.operations[0][0]=='comment' && tx.operations[0][1].parent_author=='';
        }).length;
        b.timestamp_milis = (new Date(resultBlock.timestamp+'Z')).getTime();
        b.witness = resultBlock.witness;
        b.loaded = true;
        var pos = self.lastBlocks.findIndex(function(blk){return blk.block_num == b.block_num});
        if(pos >= 0){
          self.$set(self.lastBlocks, pos, b);
          if(pos == 0 && b.witness == self.schedule[0]) self.schedule.shift()
        }
      }).catch(function(error){
        console.log(error)
      })
    },

    handleInputSlider() {
      let self = this
      this.$nextTick( ()=>{
        var slider = document.getElementById('slider-example-post')
        slider.oninput = function() {
          self.example_post.exponent = self.example_post.slider * (3 - (-3))/500 -3 // (10^3sbd - 10^-3sbd)/slider_resolution + 10^-3sbd
          self.example_post.payout = Math.pow(10, self.example_post.exponent)

          var payout_steem = self.example_post.payout / self.chain.feed_price
          var claims = payout_steem * self.chain.recent_claims / self.chain.reward_balance
          var rshares = (claims-4e12)/2 + Math.sqrt( claims*claims + 6*claims*4e12 + 4e12*4e12 )/2
          self.example_post.claims_per_rshare = claims/rshares
        }
      })
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

.slider {
  -webkit-appearance: button;
  width: 200px;
  height: 6px;
  border-radius: 5px;
  background: #C3C3C3;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #3c6fc7;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}

</style>
