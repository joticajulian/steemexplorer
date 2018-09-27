<template>
  <div class="transaction">
    <div class="tx-link">
      <a :href="'#/tx/'+trx_id">{{trx_id.substring(0,7)}}</a>
    </div
    ><span class="operation break-word">
      <div v-if="typeOp == 'curation_reward'">
        <a :href="'#/@'+op.curator">{{op.curator}}</a> curation reward: {{op.reward}} for <a :href="link(op.comment_author,op.comment_permlink)">{{linkCut(op.comment_author,op.comment_permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'vote'">
        <a :href="'#/@'+op.voter">{{op.voter}}</a> upvote <a :href="link(op.author,op.permlink)">{{linkCut(op.author, op.permlink)}}</a> ({{(op.weight/100).toFixed(2)}}%)
      </div>
      <div v-else-if="typeOp == 'transfer'">
        <a :href="'#/@'+op.from">{{op.from}}</a> transfer {{op.amount}} to {{op.to}}. Memo: <span class="memo">{{op.memo}}</span>
      </div>
      <div v-else-if="typeOp == 'delegate_vesting_shares'">
        <a :href="'#/@'+op.delegator">{{op.delegator}}</a> delegate {{op.delegatee}} {{op.vesting_shares}}
      </div>
      <div v-else-if="typeOp == 'account_create_with_delegation'">
        <a :href="'#/@'+op.creator">{{op.creator}}</a> create account {{op.new_account_name}}. Fee: {{op.fee}}. Delegation: {{op.delegation}}
      </div>
      <div v-else-if="typeOp == 'comment'">
        <a :href="'#/@'+op.author">{{op.author}}</a> replied to <a :href="link(op.parent_author,op.parent_permlink)">{{linkCut(op.parent_author,op.parent_permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'transfer_to_vesting'">
        <a :href="'#/@'+op.from">{{op.from}}</a> power up {{op.amount}} to {{op.to}}
      </div>
      <div v-else-if="typeOp == 'fill_vesting_withdraw'">
        <a :href="'#/@'+op.from_account">{{op.from_account}}</a> withdraw {{op.withdrawn}} as {{op.deposited}}
      </div>
      <div v-else-if="typeOp == 'return_vesting_delegation'">
        <a :href="'#/@'+op.account">{{op.account}}</a> return of {{op.vesting_shares}} delegation
      </div>
      <div v-else-if="typeOp == 'claim_account'">
        <a :href="'#/@'+op.creator">{{op.creator}}</a> claim account. Fee: {{op.fee}}
      </div>
      <div v-else-if="typeOp == 'producer_reward'">
        <a :href="'#/@'+op.producer">{{op.producer}}</a> producer reward: {{op.vesting_shares}}
      </div>
      <div v-else-if="typeOp == 'feed_publish'">
        <a :href="'#/@'+op.publisher">{{op.publisher}}</a> feed price ${{feedPrice}}
      </div>
      <div v-else-if="typeOp == 'witness_update'">
        <a :href="'#/@'+op.owner">{{op.owner}}</a> update witness. Creation fee: {{op.props.account_creation_fee}}
      </div>
      <div v-else-if="typeOp == 'account_witness_vote'">
        <a :href="'#/@'+op.account">{{op.account}}</a> <span v-if="op.approve">approve</span><span v-else>unapprove</span> witness {{op.witness}}
      </div>
      <div v-else-if="typeOp == 'claim_reward_balance'">
        <a :href="'#/@'+op.account">{{op.account}}</a> claim reward: {{op.reward_sbd}}, {{op.reward_steem}}, {{op.reward_vests}}
      </div>
      <div v-else-if="typeOp == 'comment_benefactor_reward'">
        <a :href="'#/@'+op.benefactor">{{op.benefactor}}</a> benefactor reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{op.vesting_payout}} for <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'author_reward'">
        <a :href="'#/@'+op.author">{{op.author}}</a> author reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{op.vesting_payout}} for <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'sm_price_feed'">
        SteemMonsters feed price: Steem ${{op.json.steem}}. SBD ${{op.json.sbd}}
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'follow' && op.json[0] == 'reblog'">
        <a :href="'#/@'+op.json[1].account">{{op.json[1].account}}</a> reblog <a :href="link(op.json[1].author,op.json[1].permlink)">{{linkCut(op.json[1].author, op.json[1].permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'follow' && op.json[0] == 'follow'">
        <a :href="'#/@'+op.json[1].follower">{{op.json[1].follower}}</a> 
        <span v-if="op.json[1].what.length>0 && op.json[1].what[0]=='blog'">follow</span>
        <span v-else>unfollow</span> {{op.json[1].following}}
      </div>
      <div v-else-if="typeOp == 'custom_json'">
        <card-data :data="op.json" :title="'custom: ' + op.id"></card-data>
      </div>
      <div v-else>
        <card-data :data="op" :title="typeOp"></card-data>      
      </div>
    </span>  
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
  data: function(){
    return {
      typeOp: this.tx[1].op[0],
      op: this.tx[1].op[1],
      trx_id: this.tx[1].trx_id,
    }
  },
  watch: {
    tx: function(newtx){
      this.typeOp = newtx[1].op[0];
      this.trx_id = newtx[1].trx_id;
      var ope = newtx[1].op[1];
          
      if(this.typeOp == 'custom_json'){ 
        ope.json = JSON.parse(ope.json)
      }
      this.op = ope;      
    }
  },
  computed: {
    feedPrice: function(){
      if(!this.op.exchange_rate) return '';
      var rate = this.op.exchange_rate;
      return (parseFloat(rate.base)/parseFloat(rate.quote)).toFixed(3);
    },   
  },
  methods: {
    link: function(author, permlink){
      return '#/@'+author+'/'+permlink;
    },
    linkCut: function(author, permlink){
      var l = '@'+author+'/'+permlink;
      var dots = l.length > 30 ? '...' : '';
      return l.substring(0,30) + dots;
    }
  },
  components: {
    CardData,
  },
}
</script>

<style scoped>
.transaction{
  border: solid 1px #8a8a8a;
  margin: 10px auto;
  display: block;
  max-width: 55rem;
  background-color: white;
}

.tx-link{
  float: right;
  font-size: 0.9rem;
  font-family: monospace;
  margin-left: 8px;
  padding: 5px;
  background-color: #f1ffc2;
}

.tx-link a{
  text-decoration: none;
  color: #8a8a8a;
}

.operation{
  display: block;
  padding: 12px 5px;
}

.operation a{
  text-decoration: none;
}

.memo{
  color: #bb5050;
  font-family: monospace;
  font-size: larger;
}
</style>
