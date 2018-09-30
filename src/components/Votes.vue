<template>
  <div class="votes">
    <div class="title">Votes</div>
    <div class="data" v-for="(v,key,index) in votes">
      <div class="row"
        ><div class="voter">
          <a :href="'#/@'+v.voter">@{{v.voter}}</a>
          <span class="reputation">({{v.rep_log}})</span>
        </div
        ><div class="weight">{{v.vote_weight}}</div
        ><div class="value">{{v.vote_value}}</div
        ><div class="curation">{{v.curation}}</div
        ><div class="time" :title="v.time">{{v.time_text}}</div        
        ></div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import Utils from '@/js/utils.js'

export default {
  name: 'votes',
  props: {
    data:{
      type: Array,
      required: true
    },
    payout:{
      type: Object,
      required: true
    },    
  },
  data: function(){
    return {
      votes: []
    }
  },
  created: function(){
    this.computeVotes(this.data, this.payout);
  },
  
  watch: {
    /*data(newData,old){
      this.computeVotes(newData,this.chain, this.payout);
    },
    payout(newPayout,old){
      this.computeVotes(this.data,newChain, newPayout);
    },
    chain(newChain,oldChain){
      this.computeVotes(this.data, newChain, this.payout);
    },*/
  },
  
  methods: {
    computeVotes: function(data,payout){
      console.log("watch data Votes");
      this.votes = this.data;
      var total_weight = 0;
      var total_rshares = this.votes.reduce(function(t,v){return t+parseInt(v.rshares)}, 0);
      var total_payout_sbd = parseFloat(payout.total);
      var total_payout_curator_sbd = 0;
      
      if(payout.old_post){
       total_payout_curator_sbd = parseFloat(payout.curator);
       total_weight = this.votes.reduce(function(t,v){return t+v.weight}, 0);
      }else{
       total_payout_curator_sbd = 0.25 * total_payout_sbd;
       total_weight = payout.total_vote_weight;
      }
      
      for(var i=0; i<this.votes.length ; i++){
        var v = this.votes[i]
        v.vote_weight = (v.percent/100).toFixed(2) + '%';
        v.vote_value = (total_payout_sbd * parseInt(v.rshares) / total_rshares).toFixed(3) +' '+ Config.SBD;
        if(payout.old_post){
          v.curation = (total_payout_curator_sbd * v.weight / total_weight).toFixed(3) +' '+ Config.SBD;
        }else{
          if(this.chain.feed_price >= 0){
            v.curation = (0.25 * total_payout_sbd * v.weight / total_weight / this.chain.feed_price).toFixed(3) +' '+ Config.SP;
          }else{
            v.curation = (0.25 * total_payout_sbd * v.weight / total_weight).toFixed(3) +' '+ Config.SBD;
          }
        }
        v.time_text = Utils.getTimestamp(v.time);
        v.rep_log = Utils.getReputation(v.reputation);
        
        this.$set(this.votes, i, v)
      }
    },
    changeFeedPrice: function(price){
      this.computeVotes(this.data, this.payout);
    }
  },
}
</script>

<style scoped>
.title{
  display: block;
  width: 100%;
  background-color: #256ca5;
  font-weight: bold;
  color: white;
  border: solid 1px #8a8a8a;
  padding: 13px 10px;
}

.row{
  display: block;
  width: 100%;
  border: solid 1px #8a8a8a;
  border-top-width: 0px;
  background-color: white;
  padding: 6px 10px;
}

.voter{
  width: 25%;
  display: inline-block;
}

.reputation{
  font-size: 0.9rem
}

.weight{
  width: 18.75%;
  display: inline-block;
  text-align: right;
}

.value{
  width: 18.75%;
  display: inline-block;
  text-align: right;
}

.curation{
  width: 18.75%;
  display: inline-block;
  text-align: right;
}

.time{
  width: 18.75%;
  display: inline-block;
  font-size: 0.8rem;
  text-align: right;
}
</style>