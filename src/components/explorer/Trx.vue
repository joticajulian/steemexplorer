<template>
  <div class="trx">
    <div class="tx-link">
      <router-link :to="EXPLORER+'b/'+blockNum+'/'+trx_id">{{trx_id.substring(0,7)}}</router-link>
    </div
    ><span class="operation break-word">
      <div v-if="typeOp == 'curation_reward'">
        <router-link :to="EXPLORER+'@'+op.curator">{{op.curator}}</router-link> curation reward: {{this.vests2sp(op.reward)}} for <router-link :to="EXPLORER+link(op.comment_author,op.comment_permlink)">{{linkCut(op.comment_author,op.comment_permlink)}}</router-link>
      </div>
      <div v-else-if="typeOp == 'vote'">
        <router-link :to="EXPLORER+'@'+op.voter">{{op.voter}}</router-link> upvote <router-link :to="EXPLORER+link(op.author,op.permlink)">{{linkCut(op.author, op.permlink)}}</router-link> ({{(op.weight/100).toFixed(2)}}%)
      </div>
      <div v-else-if="typeOp == 'transfer'">
        <router-link :to="EXPLORER+'@'+op.from">{{op.from}}</router-link> transfer {{op.amount}} to <router-link :to="EXPLORER+'@'+op.to">{{op.to}}</router-link>. Memo: <span class="memo">{{op.memo}}</span>
      </div>
      <div v-else-if="typeOp == 'delegate_vesting_shares'">
        <router-link :to="EXPLORER+'@'+op.delegator">{{op.delegator}}</router-link> delegate <router-link :to="EXPLORER+'@'+op.delegatee">{{op.delegatee}}</router-link> {{this.vests2sp(op.vesting_shares)}}
      </div>
      <div v-else-if="typeOp == 'comment' && op.parent_author != ''">
        <router-link :to="EXPLORER+'@'+op.author">{{op.author}}</router-link> replied to <router-link :to="EXPLORER+link(op.parent_author,op.parent_permlink)">{{linkCut(op.parent_author,op.parent_permlink)}}</router-link>. <span class="memo">{{op.body.substring(0,140)}}{{op.body.length>140?'...':''}}</span>
      </div>
      <div v-else-if="typeOp == 'comment' && op.parent_author == ''">
        <router-link :to="EXPLORER+'@'+op.author">{{op.author}}</router-link> authored a post: <router-link :to="EXPLORER+link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</router-link>
      </div>
      <div v-else-if="typeOp == 'transfer_to_vesting'">
        <router-link :to="EXPLORER+'@'+op.from">{{op.from}}</router-link> power up {{op.amount}} to <router-link :to="EXPLORER+'@'+op.to">{{op.to}}</router-link>
      </div>
      <div v-else-if="typeOp == 'withdraw_vesting'">
        <router-link :to="EXPLORER+'@'+op.account">{{op.account}}</router-link> start power down {{this.vests2sp(op.vesting_shares)}}
      </div>
      <div v-else-if="typeOp == 'fill_vesting_withdraw'">
        <router-link :to="EXPLORER+'@'+op.from_account">{{op.from_account}}</router-link> withdraw {{op.withdrawn}} as {{op.deposited}}
      </div>
      <div v-else-if="typeOp == 'return_vesting_delegation'">
        <router-link :to="EXPLORER+'@'+op.account">{{op.account}}</router-link> return of {{this.vests2sp(op.vesting_shares)}} delegation
      </div>
      <div v-else-if="typeOp == 'claim_account'">
        <router-link :to="EXPLORER+'@'+op.creator">{{op.creator}}</router-link> claim account. Fee: {{op.fee}}
      </div>
      <div v-else-if="typeOp == 'create_claimed_account'">
        <router-link :to="EXPLORER+'@'+op.creator">{{op.creator}}</router-link> create claimed account <router-link :to="EXPLORER+'@'+op.new_account_name">{{op.new_account_name}}</router-link>
      </div>
      <div v-else-if="typeOp == 'account_create_with_delegation'">
        <router-link :to="EXPLORER+'@'+op.creator">{{op.creator}}</router-link> create account <router-link :to="EXPLORER+'@'+op.new_account_name">{{op.new_account_name}}</router-link>. Fee: {{op.fee}}. Delegation: {{this.vests2sp(op.delegation)}}
      </div>
      <div v-else-if="typeOp == 'account_create'">
        <router-link :to="EXPLORER+'@'+op.creator">{{op.creator}}</router-link> create account <router-link :to="EXPLORER+'@'+op.new_account_name">{{op.new_account_name}}</router-link>. Fee: {{op.fee}}.
      </div>
      <div v-else-if="typeOp == 'producer_reward'">
        <router-link :to="EXPLORER+'@'+op.producer">{{op.producer}}</router-link> producer reward: {{this.vests2sp(op.vesting_shares)}}
      </div>
      <div v-else-if="typeOp == 'feed_publish'">
        <router-link :to="EXPLORER+'@'+op.publisher">{{op.publisher}}</router-link> feed price ${{feedPrice}}
      </div>
      <div v-else-if="typeOp == 'witness_update'">
        <router-link :to="EXPLORER+'@'+op.owner">{{op.owner}}</router-link> update witness. Creation fee: {{op.props.account_creation_fee}}
      </div>
      <div v-else-if="typeOp == 'account_witness_vote'">
        <router-link :to="EXPLORER+'@'+op.account">{{op.account}}</router-link><span v-if="op.approve"> approve</span><span v-else> unapprove</span> witness <router-link :to="EXPLORER+'@'+op.witness">{{op.witness}}</router-link>
      </div>
      <div v-else-if="typeOp == 'claim_reward_balance'">
        <router-link :to="EXPLORER+'@'+op.account">{{op.account}}</router-link> claim reward: {{op.reward_sbd}}, {{op.reward_steem}}, {{this.vests2sp(op.reward_vests)}}
      </div>
      <div v-else-if="typeOp == 'comment_benefactor_reward'">
        <router-link :to="EXPLORER+'@'+op.benefactor">{{op.benefactor}}</router-link> benefactor reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{this.vests2sp(op.vesting_payout)}} for <router-link :to="EXPLORER+link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</router-link>
      </div>
      <div v-else-if="typeOp == 'author_reward'">
        <router-link :to="EXPLORER+'@'+op.author">{{op.author}}</router-link> author reward: {{op.sbd_payout}}, {{op.steem_payout}}, {{this.vests2sp(op.vesting_payout)}} for <router-link :to="EXPLORER+link(op.author,op.permlink)">{{linkCut(op.author,op.permlink)}}</router-link>
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'sm_price_feed'">
        SteemMonsters feed price: Steem ${{op.json.steem}}. SBD ${{op.json.sbd}}
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'follow' && op.json[0] == 'reblog'">
        <router-link :to="EXPLORER+'@'+op.json[1].account">{{op.json[1].account}}</router-link> reblog <router-link :to="EXPLORER+link(op.json[1].author,op.json[1].permlink)">{{linkCut(op.json[1].author, op.json[1].permlink)}}</router-link>
      </div>
      <div v-else-if="typeOp == 'custom_json' && op.id == 'follow' && op.json[0] == 'follow'">
        <router-link :to="EXPLORER+'@'+op.json[1].follower">{{op.json[1].follower}}</router-link> 
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
import CardData from '@/components/explorer/CardData'
import Config from '@/config.js'
import Utils from '@/js/utils.js'
import ChainProperties from '@/mixins/ChainProperties.js'

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
      EXPLORER: Config.EXPLORER
    }
  },
  
  mixins: [
    ChainProperties
  ],
  
  created: function(){
    this.getChainProperties().then( ()=> {
      this.processTx(this.tx);
    })
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
      return '@'+author+'/'+permlink;
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
        if(newTx.operations.length > 0){
          this.typeOp = newTx.operations[0][0];
          this.trx_id = newTx.transaction_id;        
          this.blockNum = newTx.block_num;
          ope = newTx.operations[0][1];
        }else{
          this.typeOp = 'No operations'
          this.trx_id = newTx.transaction_id;
          this.blockNum = newTx.block_num;
          ope = {}
        }        
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
