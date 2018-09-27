<template>
  <div class="transaction">
    <span class="operation break-word">
      <div class="tx-link">
        <a :href="'/tx/'+trx_id">{{trx_id.substring(0,7)}}</a>
      </div
      ><div v-if="typeOp == 'curation_reward'">
        <a :href="'@'+op.curator">{{op.curator}}</a> curation reward: {{op.reward}} for <a :href="link(op.comment_author,op.comment_permlink)">{{linkCut(op.comment_author,op.comment_permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'vote'">
        <a :href="'@'+op.voter">{{op.voter}}</a> upvote <a :href="link(op.author,op.permlink)">{{linkCut(op.author, op.permlink)}}</a> ({{(op.weight/100).toFixed(2)}}%)
      </div>
      <div v-else-if="typeOp == 'transfer'">
        <a :href="'@'+op.from">{{op.from}}</a> transfer {{op.amount}} to {{op.to}}. Memo: <span class="memo">{{op.memo}}</span>
      </div>
      <div v-else-if="typeOp == 'delegate_vesting_shares'">
        <a :href="'@'+op.delegator">{{op.delegator}}</a> delegate {{op.delegatee}} {{op.vesting_shares}}
      </div>
      <div v-else-if="typeOp == 'account_create_with_delegation'">
        <a :href="'@'+op.creator">{{op.creator}}</a> create account {{op.new_account_name}}. Fee: {{op.fee}}. Delegation: {{op.delegation}}
      </div>
      <div v-else-if="typeOp == 'comment'">
        <a :href="'@'+op.author">{{op.author}}</a> replied to <a :href="link(op.parent_author,op.parent_permlink)">{{linkCut(op.parent_author,op.parent_permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'transfer_to_vesting'">
        <a :href="'@'+op.from">{{op.from}}</a> power up {{op.amount}} to {{op.to}}
      </div>
      <div v-else-if="typeOp == 'fill_vesting_withdraw'">
        <a :href="'@'+op.from_account">{{op.from_account}}</a> withdraw {{op.withdrawn}} as {{op.deposited}}
      </div>
      <div v-else-if="typeOp == 'return_vesting_delegation'">
        <a :href="'@'+op.account">{{op.account}}</a> return of {{op.vesting_shares}} delegation
      </div>
      <div v-else-if="typeOp == 'claim_account'">
        <a :href="'@'+op.creator">{{op.creator}}</a> claim account. Fee: {{op.fee}}
      </div>
      <div v-else-if="typeOp == 'producer_reward'">
        <a :href="'@'+op.producer">{{op.producer}}</a> producer reward: {{op.vesting_shares}}
      </div>
      <div v-else-if="typeOp == 'feed_publish'">
        <a :href="'@'+op.publisher">{{op.publisher}}</a> feed price ${{feedPrice}}
      </div>
      <div v-else-if="typeOp == 'witness_update'">
        <a :href="'@'+op.owner">{{op.owner}}</a> update witness. Creation fee: {{op.props.account_creation_fee}}
      </div>
      <div v-else-if="typeOp == 'account_witness_vote'">
        <a :href="'@'+op.account">{{op.account}}</a> <span v-if="op.approve">approve</span><span v-else>unapprove</span> witness {{op.witness}}
      </div>
      <div v-else-if="typeOp == 'claim_reward_balance'">
        <a :href="'@'+op.account">{{op.account}}</a> claim reward: {{op.reward_sbd}}, {{op.reward_steem}}, {{op.reward_vests}}
      </div>
      <div v-else-if="typeOp == 'comment_benefactor_reward'">
        <a :href="'@'+op.benefactor">{{op.benefactor}}</a> benefactor reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{op.vesting_payout}} for <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'author_reward'">
        <a :href="'@'+op.author">{{op.author}}</a> author reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{op.vesting_payout}} for <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'sm_price_feed'">
        SteemMonsters feed price: Steem ${{custom_json.steem}}. SBD ${{custom_json.sbd}}
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'follow' && custom_json[0] == 'reblog'">
        <a :href="'@'+custom_json[1].account">{{custom_json[1].account}}</a> reblog <a :href="link(custom_json[1].author,custom_json[1].permlink)">{{linkCut(custom_json[1].author, custom_json[1].permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'follow' && custom_json[0] == 'follow'">
        <a :href="'@'+custom_json[1].follower">{{custom_json[1].follower}}</a> 
        <span v-if="custom_json[1].what.length>0 && custom_json[1].what[0]=='blog'">follow</span>
        <span v-else>unfollow</span> {{custom_json[1].following}}
      </div>
      <div v-else-if="typeOp == 'custom_json'">
        <card-data :data="op" title="custom_json"></card-data>
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
      this.op = newtx[1].op[1];
      this.trx_id = newtx[1].trx_id;
    }
  },
  computed: {
    feedPrice: function(){
      if(!this.op.exchange_rate) return '';
      var rate = this.op.exchange_rate;
      return (parseFloat(rate.base)/parseFloat(rate.quote)).toFixed(3);
    },
    custom_json: function(){
      if(this.op.json) return JSON.parse(this.op.json);
      return {};
    },    
  },
  methods: {
    link: function(author, permlink){
      return '@'+author+'/'+permlink;
    },
    linkCut: function(author, permlink){
      return this.link(author, permlink).substring(0,30) + '...';
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
  margin: 10px;
  padding: 5px;
}

.tx-link{
  float: right;
  font-size: 0.9rem;
  font-family: monospace;
  margin-left: 8px;
}

.tx-link a{
  text-decoration: none;
  color: #8a8a8a;
}

.operation{
  display: block;
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
