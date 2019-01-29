<template>
  <div class="votes">
    <div class="title"
      ><div class="voter">Voter</div
      ><div class="weight">Weight</div
      ><div class="value">Value</div
      ><div class="curation">Curation</div
      ><div class="curation">Time</div        
    ></div>
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
  
  computed: {
    votes: function(){
      var votes_aux = this.data.sort(function(a,b){return parseInt(b.rshares) - parseInt(a.rshares)});
      var total_weight = 0;
      var total_rshares = votes_aux.reduce(function(t,v){return t+parseInt(v.rshares)}, 0);
      var total_payout_sbd = parseFloat(this.payout.total);
      var total_payout_curator_sbd = 0;
      
      if(this.payout.old_post){
       total_payout_curator_sbd = parseFloat(this.payout.curator);
       total_weight = votes_aux.reduce(function(t,v){return t+v.weight}, 0);
      }else{
       total_payout_curator_sbd = 0.25 * total_payout_sbd;
       total_weight = this.payout.total_vote_weight;
      }
      
      for(var i=0; i<votes_aux.length ; i++){
        var v = votes_aux[i]
        v.vote_weight = (v.percent/100).toFixed(2) + '%';
        v.vote_value = (total_payout_sbd * parseInt(v.rshares) / total_rshares).toFixed(3) +' '+ Config.SBD;
        if(this.payout.old_post){
          v.curation = (total_payout_curator_sbd * v.weight / total_weight).toFixed(3) +' '+ Config.SBD;
        }else{
          if(this.chain.feed_price >= 0){
            v.curation = (total_payout_curator_sbd * v.weight / total_weight / this.chain.feed_price).toFixed(3) +' '+ Config.SP;
          }else{
            v.curation = (total_payout_curator_sbd * v.weight / total_weight).toFixed(3) +' '+ Config.SBD;
          }
        }
        v.time_text = Utils.getTimestamp(v.time);
        v.rep_log = Utils.getReputation(v.reputation);
        votes_aux[i] = v;        
      }
      return votes_aux;      
    }
  },
}
</script>

<style scoped>
.title{
  display: block;
  width: 100%;
  border: solid 1px #8a8a8a;
  color: #a0a0a0;
  background-color: white;
  padding: 6px 10px;
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