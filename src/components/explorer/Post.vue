<template>
  <div class="post">
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
    <div v-if="this.exists">
    <div class="row">
      <div class="col-md-3">      
        <h3 class="right">Payout: {{payout.total}}</h3>
        <card-data :data="this.payout.card"></card-data>
        <div v-if="post.depth==0">
          <h2>Post Info</h2>
        </div>
        <div v-else>
          <h2>Comment Info</h2>
        </div>
        <card-data :data="this.postGenerals"></card-data>  
      </div
      ><div class="col-md-9">
        <h2><router-link :to="EXPLORER+'@'+post.author">@{{post.author}}</router-link> ({{this.getReputation(post.author_reputation)}})</h2>
        <div v-if="post.depth==0">
          <h1>{{post.title}}</h1>
        </div>
        <div v-else>
          <h1>Comment</h1>
          <div v-if="post.depth > 1">
            <router-link :to="EXPLORER+'@'+post.parent_author+'/'+post.parent_permlink">Parent Comment</router-link>
          </div>
          <router-link :to="EXPLORER+'@'+post.root_author+'/'+post.root_permlink">Root Post</router-link>
        </div>
        <div class="body break-word">{{post.body}}</div>
        <h2>JSON metadata</h2>
        <card-data :data="this.post.json_metadata"></card-data>
        <h2>{{this.post.active_votes.length}} Votes</h2>
        <votes :data="this.post.active_votes" :payout="payout"></votes>
        <div v-if="this.post.beneficiaries.length > 0">
          <h2>Beneficiaries</h2>
          <beneficiaries :data="this.post.beneficiaries" :payout="payout"></beneficiaries>
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
import Utils from '@/js/utils.js'
import HeaderEFTG from '@/components/HeaderEFTG'
import CardData from '@/components/explorer/CardData'
import Votes from '@/components/explorer/Votes'
import Beneficiaries from '@/components/explorer/Beneficiaries'
import ChainProperties from '@/mixins/ChainProperties.js'

export default {
  name: 'post',
  data () {
    return {
      post:{},
      payout:{total:'',card:{}},
      exists: false,
      EXPLORER: Config.EXPLORER  
    }
  },
  
  components: {
    HeaderEFTG,
    CardData,
    Votes,
    Beneficiaries
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
    getReputation: Utils.getReputation,
    
    async fetchData() {
      var author = this.$route.params.account;
      var permlink = this.$route.params.permlink;
      console.log('Fetching data for '+author+'/'+permlink);
      var self = this;
      //var result = await this.client.database.call('get_content',[author,permlink])
      var result = await this.steem_database_call('get_content',[author,permlink])
      
      result.json_metadata = JSON.parse(result.json_metadata);
      this.post = result;
        
      var no_keys = ['body','json_metadata','beneficiaries','active_votes','replies','body_length','reblogged_by'];
        
      var pst = {};
      for(var key in this.post){
        if(no_keys.indexOf(key) >= 0) continue;
        pst[key] = this.post[key];
      }        
      this.postGenerals = pst;
                
      this.payout.old_post = (new Date()) - (new Date(result.cashout_time+'Z')) > 0;
      if(this.payout.old_post){
        this.payout.total = (parseFloat(result.total_payout_value) + parseFloat(result.curator_payout_value)).toFixed(3) +' '+ Config.SBD;
        this.payout.author = result.total_payout_value;
        this.payout.curator = result.curator_payout_value;
      }else{
        this.payout.total = result.pending_payout_value;
        this.payout.total_vote_weight = result.total_vote_weight;
      }
      this.payoutCard();
      this.exists = true;            
    },
    
    payoutCard(){
      var total_payout_sbd = parseFloat(this.payout.total);
      var total_payout_author_sbd = 0;
      var total_payout_curator_sbd = 0;
      var total_payout_reward_pool_sbd = 0;
      var forward_curation_remainder = this.HARDFORK <= 19;
      
      if(this.payout.old_post){
        total_payout_author_sbd = parseFloat(this.payout.author);
        total_payout_curator_sbd = parseFloat(this.payout.curator);
      }else{
        total_payout_author_sbd = 0.75 * total_payout_sbd ;
        total_payout_curator_sbd = 0.25 * total_payout_sbd;
        var curation_remainder = total_payout_curator_sbd * (this.post.total_vote_weight - this.post.active_votes.reduce(function(t,v){return t+v.weight}, 0) ) / this.post.total_vote_weight;
        total_payout_curator_sbd -= curation_remainder;
        if( forward_curation_remainder ){
          total_payout_author_sbd += curation_remainder;
        }else{
          total_payout_reward_pool_sbd = curation_remainder;
        }
      }
      
      var total_weight_beneficiaries = this.post.beneficiaries.reduce(function(t,b){return t+parseInt(b.weight)},0);
      var total_payout_beneficiaries_sbd = total_payout_author_sbd * total_weight_beneficiaries / 10000;
      total_payout_author_sbd -= total_payout_beneficiaries_sbd;
      
      this.payout.card = {
        Author: total_payout_author_sbd.toFixed(3) + ' ' + Config.SBD +
               ' ('+(100*total_payout_author_sbd/total_payout_sbd).toFixed(2)+'%)',
        Curators: total_payout_curator_sbd.toFixed(3) + ' ' + Config.SBD +
               ' ('+(100*total_payout_curator_sbd/total_payout_sbd).toFixed(2)+'%)',
        Beneficiaries: total_payout_beneficiaries_sbd.toFixed(3) + ' ' + Config.SBD +
               ' ('+(100*total_payout_beneficiaries_sbd/total_payout_sbd).toFixed(2)+'%)',
      };
      
      if(total_payout_reward_pool_sbd > 0){
        this.payout.card.Reward_Pool = total_payout_reward_pool_sbd.toFixed(3) + ' ' + Config.SBD +
               ' ('+(100*total_payout_reward_pool_sbd/total_payout_sbd).toFixed(2)+'%)';
      }
    }
  }
}
</script>

<style scoped>

.header{
  width: 100%;
  display: block;
  margin-bottom: 15px;
}

.title{
  font-weight: bold;
  font-size: 1.3rem;
  display: block;
}

.payout{
  float: right;
  font-size: 1.3rem;
  font-weight: bold;
  margin-left: 25px;
}

.body{
  background-color: white;
  font-family: monospace;
  padding: 10px 15px;
  margin: 10px auto;
  border: solid 1px #8a8a8a;
}

</style>
