<template>
  <div class="trx">
    <div class="tx-link">
      <a :href="'#/b/'+blockNum+'/'+trx_id">{{trx_id.substring(0,7)}}</a>
    </div
    ><span class="operation break-word">
      <div v-if="typeOp == 'curation_reward'">
        <a :href="'#/@'+op.curator">{{op.curator}}</a> curation reward: {{this.vests2sp(op.reward)}} for <a :href="link(op.comment_author,op.comment_permlink)">{{linkCut(op.comment_author,op.comment_permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'vote'">
        <a :href="'#/@'+op.voter">{{op.voter}}</a> upvote <a :href="link(op.author,op.permlink)">{{linkCut(op.author, op.permlink)}}</a> ({{(op.weight/100).toFixed(2)}}%)
      </div>
      <div v-else-if="typeOp == 'transfer'">
        <a :href="'#/@'+op.from">{{op.from}}</a> transfer {{op.amount}} to <a :href="'#/@'+op.to">{{op.to}}</a>. Memo: <span class="memo">{{op.memo}}</span>
      </div>
      <div v-else-if="typeOp == 'delegate_vesting_shares'">
        <a :href="'#/@'+op.delegator">{{op.delegator}}</a> delegate <a :href="'#/@'+op.delegatee">{{op.delegatee}}</a> {{this.vests2sp(op.vesting_shares)}}
      </div>
      <div v-else-if="typeOp == 'comment' && op.parent_author != ''">
        <a :href="'#/@'+op.author">{{op.author}}</a> replied to <a :href="link(op.parent_author,op.parent_permlink)">{{linkCut(op.parent_author,op.parent_permlink)}}</a>. <span class="memo">{{op.body.substring(0,140)}}{{op.body.length>140?'...':''}}</span>
      </div>
      <div v-else-if="typeOp == 'comment' && op.parent_author == ''">
        <a :href="'#/@'+op.author">{{op.author}}</a> authored a post: <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'transfer_to_vesting'">
        <a :href="'#/@'+op.from">{{op.from}}</a> power up {{op.amount}} to <a :href="'#/@'+op.to">{{op.to}}</a>
      </div>
      <div v-else-if="typeOp == 'withdraw_vesting'">
        <a :href="'#/@'+op.account">{{op.account}}</a> start power down {{this.vests2sp(op.vesting_shares)}}
      </div>
      <div v-else-if="typeOp == 'fill_vesting_withdraw'">
        <a :href="'#/@'+op.from_account">{{op.from_account}}</a> withdraw {{op.withdrawn}} as {{op.deposited}}
      </div>
      <div v-else-if="typeOp == 'return_vesting_delegation'">
        <a :href="'#/@'+op.account">{{op.account}}</a> return of {{this.vests2sp(op.vesting_shares)}} delegation
      </div>
      <div v-else-if="typeOp == 'claim_account'">
        <a :href="'#/@'+op.creator">{{op.creator}}</a> claim account. Fee: {{op.fee}}
      </div>
      <div v-else-if="typeOp == 'create_claimed_account'">
        <a :href="'#/@'+op.creator">{{op.creator}}</a> create claimed account <a :href="'#/@'+op.new_account_name">{{op.new_account_name}}</a>
      </div>
      <div v-else-if="typeOp == 'account_create_with_delegation'">
        <a :href="'#/@'+op.creator">{{op.creator}}</a> create account <a :href="'#/@'+op.new_account_name">{{op.new_account_name}}</a>. Fee: {{op.fee}}. Delegation: {{this.vests2sp(op.delegation)}}
      </div>
      <div v-else-if="typeOp == 'account_create'">
        <a :href="'#/@'+op.creator">{{op.creator}}</a> create account <a :href="'#/@'+op.new_account_name">{{op.new_account_name}}</a>. Fee: {{op.fee}}.
      </div>
      <div v-else-if="typeOp == 'producer_reward'">
        <a :href="'#/@'+op.producer">{{op.producer}}</a> producer reward: {{this.vests2sp(op.vesting_shares)}}
      </div>
      <div v-else-if="typeOp == 'feed_publish'">
        <a :href="'#/@'+op.publisher">{{op.publisher}}</a> feed price ${{feedPrice}}
      </div>
      <div v-else-if="typeOp == 'witness_update'">
        <a :href="'#/@'+op.owner">{{op.owner}}</a> update witness. Creation fee: {{op.props.account_creation_fee}}
      </div>
      <div v-else-if="typeOp == 'account_witness_vote'">
        <a :href="'#/@'+op.account">{{op.account}}</a> <span v-if="op.approve">approve</span><span v-else>unapprove</span> witness <a :href="'#/@'+op.witness">{{op.witness}}</a>
      </div>
      <div v-else-if="typeOp == 'claim_reward_balance'">
        <a :href="'#/@'+op.account">{{op.account}}</a> claim reward: {{op.reward_sbd}}, {{op.reward_steem}}, {{this.vests2sp(op.reward_vests)}}
      </div>
      <div v-else-if="typeOp == 'comment_benefactor_reward'">
        <a :href="'#/@'+op.benefactor">{{op.benefactor}}</a> benefactor reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{this.vests2sp(op.vesting_payout)}} for <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
      </div>
      <div v-else-if="typeOp == 'author_reward'">
        <a :href="'#/@'+op.author">{{op.author}}</a> author reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{this.vests2sp(op.vesting_payout)}} for <a :href="link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</a>
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
import Utils from '@/js/utils.js'

export default {
  name: 'trx',
  props: {
    tx:{
      type: [Array,Object],
      required: true,
    },    
  },
  data: function(){
    return {
      typeOp: '',
      op: {},
      trx_id: '',
      blockNum: 0,
    }
  },
  
  created: function(){
    this.processTx(this.tx);
  },
  
  watch: {
    tx: function(newTx){
      this.processTx(newTx);      
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
    },
    processTx: function(newTx){
      var ope;
      if(Array.isArray(newTx)){ //account history
        this.typeOp = newTx[1].op[0];
        this.trx_id = newTx[1].trx_id;      
        this.blockNum = newTx[1].block;
        ope = newTx[1].op[1];        
      }else{ //block
        this.typeOp = newTx.operations[0][0];
        this.trx_id = newTx.transaction_id;        
        this.blockNum = newTx.block_num;
        ope = newTx.operations[0][1];        
      }
      
      if(this.typeOp == 'custom_json'){ 
        ope.json = JSON.parse(ope.json)
      }
      this.op = ope;
    },
  },
  components: {
    CardData,
  },
}
</script>

<style scoped>
.trx{
  border: solid 1px #dcdcdc;
  /*border-left-width: 4px;  */
  border-radius: 5px;
  margin: 10px auto;
  display: block;
  background-color: white;
}

.trx:hover{
  /*border-left-color: #72b4e8;*/
  /*background-color: #f9f9ff;*/
  box-shadow: 0px 0px 2px #72b4e8; 
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
  padding: 8px 10px;
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
