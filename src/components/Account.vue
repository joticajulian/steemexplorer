<template>
  <div class="account">
    <div v-if="this.exists">
      <div class="profile">
        <div class="image" :style="'background-image: url('+this.account.profile_image+');'"></div>
        <div class="name"><h1><strong>@{{this.account.name}}</strong> ({{account.rep_log}})</h1></div>
      </div>
      <div class="info1">
        <card-data :data="this.accountGenerals"></card-data>
      </div
      ><div class="info2">
        <h2>JSON metadata</h2>
        <card-data :data="this.account.json_metadata"></card-data>
        <h2>Transactions</h2>
        <div v-for="(tx,key,index) in transactions">
          <transaction :tx="tx"></transaction>
        </div>
      </div>  
    </div>
  </div>
</template>

<script>
import Utils from '@/js/utils.js'
import CardData from '@/components/CardData'
import Transaction from '@/components/Transaction'

export default {
  name: 'Account',
  data () {
    return {
      account: {
      },
      accountGenerals: {      
      },
      transactions: {
      },
      from: -1,
      limit: 100,
      exists: false,
    }
  },
  
  components: {
    CardData,
    Transaction
  },
  
  created() {
    this.fetchData()
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    fetchData() {
      var name = this.$route.params.account;
      console.log('Fetching data for '+name);
      var self = this;
      steem.api.getAccounts([name], function (err, result) {      
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }
        self.exists = true;
        
        result[0].json_metadata = JSON.parse(result[0].json_metadata)
        result[0].rep_log = Utils.getReputation(result[0].reputation);
        result[0].profile_image = Utils.extractUrlProfileImage(result[0].json_metadata);
        self.account = result[0];
        
        var no_keys = ['owner','active','posting','memo_key','json_metadata','voting_manabar','proxied_vsf_votes','transfer_history','market_history','post_history','vote_history','other_history','witness_votes','tags_usage','guest_bloggers','rep_log'];
        
        var acc = {};
        for(var key in self.account){
          if(no_keys.indexOf(key) >= 0) continue;
          acc[key] = self.account[key];
        }
        
        self.accountGenerals = acc;
        
        //var keys = ['id','name','last_owner_update','last_account_update','created','mined','recovery_account','last_account_recovery','reset_account','comment_count','lifetime_vote_count','post_count','can_vote','voting_power','balance','savings_balance','sbd_balance','sbd_seconds','sbd_seconds_last_update','sbd_last_interest_payment','savings_sbd_balance','savings_sbd_seconds','savings_sbd_seconds_last_update','savings_sbd_last_interest_payment','savings_withdraw_requests'];
        
      });
      steem.api.getAccountHistory(name,this.from,this.limit, function(err, result) {
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }        
        self.transactions = result;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.profile{  
  text-align: center;
  display: block;
  height: 10rem;
  background-color: black;
}

.info1{
  display: block;
  margin: 15px 50px;
}

.info2{
  display: block;
  margin: 15px 50px;
}

.image{
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  padding: 7px;
  height: 3.5rem;
  width: 3.5rem;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.name{
  display: inline-block;  
}

.reputation{
  font-size: 1.5rem;
  display: inline-block;
}

@media only screen and (min-width: 768px) {
  .info1{
    display: inline-block;
    width: 18rem;
    vertical-align: top;
    margin: 15px 10px 15px 50px;    
  }

  .info2{
    display: inline-block;
    width: calc(100% - 18rem - 120px);
    vertical-align: top;
    margin: 15px 50px 15px 10px;
  }
}
</style>
