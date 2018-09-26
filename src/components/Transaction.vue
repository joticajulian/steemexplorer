<template>
  <div class="transaction">
    <div v-if="tx[1].op[0] == 'curation_reward'"
      >{{tx[1].op[1].curator}} curation reward: {{tx[1].op[1].reward}} for <a :href="'/@'+tx[1].op[1].comment_author+'/'+tx[1].op[1].comment_permlink">{{'/@'+tx[1].op[1].comment_author+'/'+tx[1].op[1].comment_permlink}}</a>
    </div>
    <div v-else-if="tx[1].op[0] == 'vote'"
      >{{tx[1].op[1].voter}} upvotes <a :href="this.linka">{{this.linka}}</a>
    </div>  
    <div v-else-if="tx[1].op[0] == 'transfer'"
      >{{tx[1].op[1].from}} transfers {{tx[1].op[1].amount}} to {{tx[1].op[1].to}}. Memo: {{tx[1].op[1].memo}}
    </div>
    <div v-else-if="tx[1].op[0] == 'comment'"
      >{{tx[1].op[1].author}} replied to <a :href="this.linka">{{this.linka}}</a>
    </div>
    <div v-else-if="tx[1].op[0] == 'fill_vesting_withdraw'"
      >{{tx[1].op[1].from_account}} withdraw {{tx[1].op[1].withdrawn}} as {{tx[1].op[1].deposited}}
    </div>
    <div v-else-if="tx[1].op[0] == 'producer_reward'"
      >{{tx[1].op[1].producer}} producer reward: {{tx[1].op[1].vesting_shares}}
    </div>
    <div v-else-if="tx[1].op[0] == 'feed_publish'"
      >{{tx[1].op[1].publisher}} feed price ${{this.feedPrice}}
    </div>
    <div v-else-if="tx[1].op[0] == 'account_witness_vote'"
      >{{this.account_witness_vote}}
    </div>
    <div v-else-if="tx[1].op[0] == 'author_reward'"
      >{{this.author_reward}}
    </div>
    <!--<div v-else-if="tx[1].op[0] == 'custom_json' && tx[1].op[1].id == 'follow'" 
      >{{this.custom_json_follow}}
    </div>-->
    <div v-else-if="tx[1].op[0] == 'custom_json'"
      ><card-data :data="tx[1].op[1]" title="custom_json"></card-data>
    </div>
    <div v-else>
      <div class="type">{{tx[1].op[0]}}</div>
      {{JSON.stringify(tx[1].op[1])}}
    </div>
  </div>
</template>

<script>
import CardData from '@/components/CardData'

export default {
  name: 'transaction',
  props: {
    tx:{
      type: Array,
      required: true
    },    
  },
  computed: {
    linka: function(){
      var op = this.tx[1].op[1];
      var author = '';
      var permlink = '';
      if(op.parent_author) author = op.parent_author;
      else if(op.comment_author) author = op.comment_author;
      else if(op.author) author = op.author;
      
      if(op.parent_permlink) permlink = op.parent_permlink;
      else if(op.comment_permlink) permlink = op.comment_permlink;
      else if(op.permlink) permlink = op.permlink;
      
      return '/@'+author+'/'+permlink;
    },
    feedPrice: function(){
      if(!this.tx[1].op[1].exchange_rate) return ' Error';
      var rate = this.tx[1].op[1].exchange_rate;
      console.log(rate);
      return (parseFloat(rate.base)/parseFloat(rate.quote)).toFixed(3);
    },
    account_witness_vote: function(){
      var op = this.tx[1].op[1];
      var approveType = op.approve ? 'approve' : 'unapprove';
      return op.account + ' ' + approveType + ' witness ' + op.witness;
    },
    author_reward: function(){
      var op = this.tx[1].op[1];
      console.log(op);
      return op.author + ' author reward: ' + op.sbd_payout + ', ' + op.steem_payout + ', ' + op.vesting_payout + '. for ' + this.link(op.author,op.permlink);
    },
    custom_json_follow: function(){
      var op = this.tx[1].op[1];
      var json = JSON.parse(op.json);
      if(json[0] == 'reblog'){
        console.log("reblog found");
        return json[1].account + ' reblog ';// + this.link(json[1].author, json[1].permlink);
      }else if(json[0] == 'follow'){
        if(json[1].what){
          if(json[1].what.length>0 && json[1].what[0]=='blog'){
            return json[1].follower + ' follows ' + json[1].following;
          }else{
            console.log("follow custom json. What:");
            console.log(json[1].what);
            return json[1].follower + ' unfollows ' + json[1].following;
          }
        }        
      }else{
        console.log("custom_json_follow");
        console.log(json);
      }
    }
  },
  methods: {
    link: function(author, permlink){
      return '/@'+author+'/'+permlink;
    }
  },
  components: {
    CardData,
  },
}
</script>

<style scoped>
.type{
  width: 100%;
  border: solid 1px #8a8a8a;
}
</style>
