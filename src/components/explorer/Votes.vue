<template>
  <div class="votes">
    <div class="title row"
      ><div class="col-2">Voter</div
      ><div class="col-2">Weight</div
      ><div class="col-2">Value</div
      ><div class="col-2">New payout</div
      ><div class="col-2">Curation</div
      ><div class="col-2">Time</div        
    ></div>
    <div class="data row" v-for="(v,key,index) in votes">
      <div class="col-2">
        <router-link :to="EXPLORER+'@'+v.voter">@{{v.voter}}</router-link>
        <span class="reputation">({{v.rep_log}})</span>
      </div
      ><div class="col-2">{{v.vote_weight}}</div
      ><div class="col-2">{{v.vote_value}}</div
      ><div class="col-2">{{v.vote_value_before}}</div
      ><div class="col-2">{{v.curation}}</div
      ><div class="col-2" :title="v.time">{{v.time_text}}</div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import Utils from '@/js/utils.js'
import ChainProperties from '@/mixins/ChainProperties.js'

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
  data() {
    return {
      EXPLORER: Config.EXPLORER
    }
  },

  mixins: [
    ChainProperties,
  ],
  
  created() {
    this.getChainProperties()
  },
  
  computed: {
    votes: function(){
      if(Config.HARDFORK < 21) return this.votesLinear()
      else return this.votesConvergentLinear()
    }
  },
  methods: {
    evaluate_curve(rshares, curve){
      switch(curve){
        case 'linear':
          return rshares
        case 'convergent_linear':
          var s = 2e12
          return rshares * (rshares + 2*s) / (rshares + 4*s)
      }
    }, 

    votesConvergentLinear() {
      var sortByTime_ascending =  (a,b)=>{return new Date(a.time) - new Date(b.time)}
      var sortByTime_descending = (a,b)=>{return new Date(a.time) - new Date(b.time)}

      var votes_aux = this.data.sort( sortByTime_ascending )
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
       if(this.payout.net_rshares != total_rshares){
         console.log('net_rshares do not coincide with the sum of votes')
         console.log(`net_rshares:       ${this.payout.net_rshares}`)
         console.log(`sum rshares votes: ${total_rshares}`)
       }else{
         console.log('net_rshares coincides with votes')
       }
      }

      var net_rshares = 0
      var curve = 'convergent_linear'
      for(var i=0; i<votes_aux.length ; i++){
        var v = votes_aux[i]
        var old_claims = this.evaluate_curve(net_rshares, curve)
        net_rshares += parseInt(v.rshares)
        var new_claims = this.evaluate_curve(net_rshares, curve)

        v.vote_value = ((new_claims-old_claims) * this.chain.sbd_per_rshare).toFixed(3) + ' ' + Config.SBD
        v.vote_value_before = (new_claims * this.chain.sbd_per_rshare).toFixed(3) + ' ' + Config.SBD
        v.vote_weight = (v.percent/100).toFixed(2) + '%';
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
      return votes_aux.reverse();      
    },

    votesLinear() {
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
  width: 100%;
  border: solid 1px #8a8a8a;
  color: #a0a0a0;
  background-color: white;
  padding: 6px 10px;
}

.data{
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