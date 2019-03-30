<template>
  <div class="account">
    <div v-if="this.exists.account">
      <div class="profile" :style="this.account.cover_image==''?'background-color: black;':'background-image: url('+this.account.cover_image+');'">
        <div>
          <div class="image" :style="'background-image: url('+this.account.profile_image+');'"></div>
          <div class="name"><h1><strong>@{{this.account.name}}</strong> ({{account.rep_log}})</h1></div>
        </div>
      </div>
      <div class="info1">
        <h2>Generals</h2>
        <card-data :data="this.accountGenerals"></card-data>
        <div v-if="this.exists.voting_manabar">
          <h2>Voting manabar</h2>
          <card-data :data="this.account.voting_manabar"></card-data>
        </div>
        <h2>Account info</h2>
        <card-data :data="this.accountGenerals2"></card-data>
        <div v-if="this.exists.witness">
          <h2>Witness info</h2>
          <card-data :data="this.witnessGenerals"></card-data>
          <h3>Witness props</h3>
          <card-data :data="this.witness.props"></card-data>
          <h3>SBD exchange rate</h3>
          <card-data :data="this.witness.sbd_exchange_rate"></card-data>          
        </div>
        <h2>{{this.account.name}} votes for</h2>
        <card-data :data="this.account.witness_votes" typeCard="witnesses" :link="true"></card-data>
        <h2>Authorities</h2>
        <div v-if="this.exists.witness">
          <h3>Signing Auth</h3>
          <card-data :data="this.authorities.signing"></card-data>
        </div>
        <h3>Owner Auth</h3>
        <card-data :data="this.authorities.owner" :link="true"></card-data>
        <h3>Active Auth</h3>
        <card-data :data="this.authorities.active" :link="true"></card-data>
        <h3>Posting Auth</h3>
        <card-data :data="this.authorities.posting" :link="true"></card-data>
        <h3>Memo Auth</h3>
        <card-data :data="this.authorities.memo"></card-data>        
      </div
      ><div class="info2">
        <div v-if="this.exists.json_metadata">
          <h2>JSON metadata</h2>
          <card-data :data="this.account.json_metadata"></card-data>
        </div>
        <h2>Transactions</h2>
        <div v-if="exists.transactions">
          <div v-for="(tx,key,index) in transactions">
            <trx :tx="tx"></trx>
          </div>
        </div>
        <div v-else>
          <div class="loader"></div>
        </div>        
        <div class="center">
          <div v-for="(p,key,index) in pages" class="page"
            ><span v-if="p.link"
              ><a :href="p.link">{{p.text}}</a
            ></span
            ><span v-else>{{p.text}}</span          
          ></div>
        </div>
      </div>  
    </div>
    <div v-else>
      <div class="loader"></div>
    </div>
  </div>
</template>

<script>
import Utils from '@/js/utils.js'
import CardData from '@/components/CardData'
import Trx from '@/components/Trx'

export default {
  name: 'Account',
  data () {
    return {
      account: {
      },
      witness: {
      },
      accountGenerals: {      
      },
      accountGenerals2: {      
      },
      witnessGenerals: {
      },
      authorities:{
      },
      transactions: {
      },
      limit: 250,
      pages: [],
      exists: {
        account: false,
        witness: false,
        json_metadata: false,
        witness_votes: false,
        voting_manabar: false,
        transactions: false,
      },      
    }
  },
  
  components: {
    CardData,
    Trx
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
      this.exists.account = false;
      this.exists.transactions = false;
      this.exists.witness = false;
      var self = this;
      steem.api.getAccounts([name], function (err, result) {      
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }
        self.exists.account = true;
        
        if(result[0].json_metadata.length > 0) self.exists.json_metadata = true;
        else self.exists.json_metadata = false;
        
        if(result[0].voting_manabar) self.exists.voting_manabar = true;
        else self.exists.voting_manabar = false;
        
        try{
          result[0].json_metadata = JSON.parse(result[0].json_metadata)
        }catch(exception){ }
        
        result[0].rep_log = Utils.getReputation(result[0].reputation);
        result[0].profile_image = Utils.extractUrlProfileImage(result[0].json_metadata);
        result[0].cover_image = Utils.extractUrlCoverImage(result[0].json_metadata);
        for(var i=0;i<result[0].witness_votes.length;i++){
          result[0].witness_votes[i] = {link:'#/@'+result[0].witness_votes[i] , text:result[0].witness_votes[i]};
        }
        
        self.account = result[0];
        
        var no_keys = ['owner','active','posting','memo_key','json_metadata','voting_manabar','proxied_vsf_votes','transfer_history','market_history','post_history','vote_history','other_history','witness_votes','tags_usage','guest_bloggers','rep_log','profile_image','cover_image',
        'balance','sbd_balance','savings_balance'];
        
        var acc = {};
        for(var key in self.account){
          if(no_keys.indexOf(key) >= 0) continue;
          acc[key] = self.account[key];
        }
        
        self.accountGenerals2 = acc;
        self.authorities.owner   = self.arrayAuthorities(self.account.owner);
        self.authorities.active  = self.arrayAuthorities(self.account.active);
        self.authorities.posting = self.arrayAuthorities(self.account.posting);
        self.authorities.memo    = [self.account.memo_key];
        
        var delegated = parseFloat(self.account.received_vesting_shares) - parseFloat(self.account.delegated_vesting_shares);
        self.accountGenerals = {
          voting_power: Utils.getVotingPower(self.account)/100 + '%',
          balance: self.account.balance,
          sbd_balance: self.account.sbd_balance,
          savings_balance: self.account.savings_balance,
          steem_power: self.vests2sp(self.account.vesting_shares) + ' (' + (delegated>0?'+':'') + self.vests2sp(delegated) + ')',
        }
      });
      
      steem.api.getAccountHistory(name,-1,1, function(err, result) {
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }
        
        var last_tx = result[0][0];        
        var from = -1;
        var limit = self.limit;
        var total_pages = Math.ceil(last_tx / limit);
        var page = 1;
        
        if(self.$route.query && self.$route.query.page){
          page = parseInt(self.$route.query.page);
          from = last_tx - limit*( page - 1 );          
        }else{
          from = last_tx;          
        }
        if(from < 0) from = 0;
        if(from < limit) limit = from;
        
        self.pages = [];
        var NUMBER_PAGES_DISPLAYED = 10;
        var ini = page-NUMBER_PAGES_DISPLAYED/2;
        var end = page+NUMBER_PAGES_DISPLAYED/2-1;
        if(ini < 1){
          end += 1-ini;
          ini = 1;          
        }
        
        if(end > total_pages){
          ini -= end-total_pages;
          if(ini < 1) ini = 1;
          end = total_pages;
        }       
        
        if(ini > 1){
          self.pages.push({text:'1',link:'#/@'+name+'?page=1'});
          self.pages.push({text:'...'});
        }
        
        for(var i=ini ; i<=end ; i++){
          self.pages.push({text:i+'',link:'#/@'+name+'?page='+i});
        }
        
        if(end < total_pages){
          self.pages.push({text:'...'});
          self.pages.push({text:total_pages+'',link:'#/@'+name+'?page='+total_pages});          
        }
    
        steem.api.getAccountHistory(name,from,limit, function(err, result) {
          if (err || !result || result.length == 0) {
            console.log(err, result);
            //Update UI
            return;
          }        
          self.transactions = result.reverse();
          self.exists.transactions = true;
        });
      });
      
      steem.api.getWitnessByAccount(name, function(err, result){
        if (err || !result) {
          //not a witness
          return;
        }
        self.witness = result;
        
        var no_keys = ['signing_key','props','sbd_exchange_rate'];
        
        var wit = {};
        for(var key in self.witness){
          if(no_keys.indexOf(key) >= 0) continue;
          wit[key] = self.witness[key];
        }
        
        self.witnessGenerals = wit;
        self.authorities.signing  = [self.witness.signing_key];
        self.exists.witness = true;
      });
    },
    
    arrayAuthorities: function(auth){
      var array = [];
      for(var i=0;i<auth.key_auths.length;i++) array.push( auth.key_auths[i][0] );
      for(var i=0;i<auth.account_auths.length;i++) array.push( {link:'#/@'+auth.account_auths[i][0] , text:auth.account_auths[i][0]} );
      return array;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.profile{  
  text-align: center;
  display: block;
  height: 8rem;  
  overflow: hidden;
  background-size: cover;
  background-position: center center;

  color: white;
  text-shadow: 2px 2px 5px #000000;  
  
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  vertical-align: middle;
}

.page{
  display: inline-block;
  margin: 10px 4px;
}

</style>
