<template>
  <div>
    <HeaderEFTG portal="OAM Portal" :showAuth="true" ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Witnesses</h2>
      <table class="table">
        <thead>
          <tr class="table-primary">
            <th scope="col">#</th>
            <th scope="col">Witness</th>
            <th scope="col">Enabled</th>
            <th scope="col">Version</th>
            <th scope="col">Approval</th>
            <th scope="col">Last Block</th>
            <th scope="col">Miss</th>
            <th scope="col">Vote</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(wit,index) in witnesses"
            v-bind:key="wit.id"
            v-bind:value="wit.owner"
          >
            <td>{{ wit.position }}</td>
            <td
              ><div v-bind:style="{ backgroundImage: 'url(' + wit.imgUrl + ')' }" class="image-profile mr-2"                  
              ></div
              ><a :href="'/#/explorer/@'+wit.owner">{{ wit.owner }}</a>
            </td>
            <td><div class="circle" :class="{enabled:wit.enabled, disabled:!wit.enabled}"></div></td>
            <td>{{ wit.running_version }}</td>
            <td>{{ wit.votes_mv }}</td>
            <td>{{ wit.last_confirmed_block_num }}</td>
            <td>{{ wit.total_missed }}</td>
            <td>
              <button class="btn" @click="toggleVote(index)" 
                :class="{'btn-primary':wit.newVote.approve, 'btn-secondary':!wit.newVote.approve}"
              >
                <font-awesome-icon icon="check"/>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="row mt-4">
        <div class="form-group col-12">
          <button @click="save" class="btn btn-primary btn-large" :disabled="saving"><div v-if="saving" class="mini loader"></div>Save</button>
          <button @click="reset" class="btn btn-secondary btn-large">Reset</button>
        </div>            
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alertText.info}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alertText.success"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alertText.danger}}</div>
    </div>    
  </div>
</template>

<script>
import debounce from "lodash.debounce";
import { Client } from 'eftg-dsteem'

import Config from "@/config.js";
import Utils from "@/js/utils.js";
import HeaderEFTG from "@/components/HeaderEFTG";

export default {
  name: "Witnesses",
  
  data() {
    return {
      client: null,

      witnesses: [],
      witnesses2: [],
      witLoaded: false,
      
      saving: false,

      error: {},
      errorText: {},
      alert: {
        success: false,
        danger: false,
        info: false,
      },
      alertText: {
        success: '',
        danger: '',
        info: ''
      },
    };
  },
  
  components: {
    HeaderEFTG    
  },
  
  created() {
    let opts = {};
    opts.addressPrefix = Config.STEEM_ADDRESS_PREFIX
    if(Config.STEEM_CHAIN_ID) opts.chainId = Config.STEEM_CHAIN_ID
    this.client = new Client(Config.RPC_NODE.url, opts)
    
    this.loadWitnessesByVote()
  
    //validate fields while typing
    //this.debounced_validateIssuerName       = debounce(this.validateIssuerName      , 300);      
  },
  
  watch: {
    /*issuer_name: function() {
      this.debounced_validateIssuerName();
    },*/    
  },
  methods: {

    async loadWitnessesByVote() {
      var witnessesByVote = await this.client.database.call('get_witnesses_by_vote',['',100])
      var names =[]

      for(var i in witnessesByVote) names.push(witnessesByVote[i].owner)
      var accounts = await this.client.database.getAccounts(names)

      this.witnesses = []
      for(var i in witnessesByVote) {
        var wit = witnessesByVote[i]
        wit.vote = {approve: false, shares: '0.000000 VESTS'}
        wit.newVote = {approve: false, shares: '0.000000 VESTS'}
        wit.votes_mv = (wit.votes/1000000).toFixed(3)+' V'
        wit.position = parseInt(i)+1
        
        if(wit.signing_key === Config.STEEM_ADDRESS_PREFIX + '1111111111111111111111111111111114T1Anm')
          wit.enabled = false
        else
          wit.enabled = true
        
        var metadata = {}
        try {
          metadata = JSON.parse(accounts[i].json_metadata)
        }catch(error){}
        wit.imgUrl = Utils.extractUrlProfileImage(metadata)
        this.witnesses.push(wit)        
      }
      this.witLoaded = true
      if(this.$store.state.auth.logged) await this.loadVotesFromAccount()
    },
    
    async loadVotesFromAccount() {
      if(!this.witLoaded) return

      var namesWitnessesNotTop = []

      var accounts = await this.client.database.getAccounts([this.$store.state.auth.user])
      var account = accounts[0]

      this.clearVotes()

      if(Config.EFTG_HARDFORK_0_1) {
        console.log('TODO: read account.witness_weight_votes because we are in EFTG_HARDFORK_0_1')
      } else {
        for(var i in account.witness_votes) {
          var votedWit = account.witness_votes[i]
          var id = this.witnesses.findIndex(function(w){ return w.owner === votedWit })
          if(id >= 0){
            var wit = this.witnesses[id]
            wit.vote.approve = true
            wit.newVote.approve = true
            this.$set(this.witnesses, id, wit)
          } else { 
            namesWitnessesNotTop.push(votedWit)
          }
        }
      }
      
      if(namesWitnessesNotTop.length > 0) {
        console.log('TODO: these witnesses are already voted but they are not in the TOP list:')
        console.log(namesWitnessesNotTop)
      }
    },
    
    onLogin() {
      this.loadVotesFromAccount()
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo() 
    },
    
    onLogout() {
      this.clearVotes()
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },
    
    toggleVote(index) {
      var wit = this.witnesses[index]
      wit.newVote.approve = !wit.newVote.approve
      this.$set(this.witnesses, index, wit)
    },
    
    save() {
      var user = this.$store.state.auth.user
      var activeKey = this.$store.state.auth.keys.active
      var ownerKey  = this.$store.state.auth.keys.owner

      if( activeKey != null ) {
        var privKey = activeKey
      }else if(ownerKey != null ) {
        var privKey = ownerKey 
      }else {
        this.showDanger('Please login with master, owner, or active key')
        return        
      }
      
      var ops = []
      for(var i in this.witnesses) {
        var wit = this.witnesses[i]
        if(wit.newVote.approve != wit.vote.approve) {
          var operation = [
            'account_witness_vote',
            {
              account: user,
              witness: wit.owner,
              approve: wit.newVote.approve
            }
          ]
          ops.push(operation)          
        }
      }

      if(ops.length == 0) {
        this.showDanger('Nothing to change in voting')
        return
      }

      this.saving = true
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()

      let self = this
      this.client.broadcast.sendOperations(ops,privKey)
      .then(function(result){
        self.saving = false
        var block = result.block_num
        var trx_id = result.id
        self.showSuccess('Votes saved! <a href="/#/explorer/b/'+block+'/'+trx_id+'" class="alert-link" target="_blank">trx link</a>')
        self.loadVotesFromAccount()
      })
      .catch(function(error){
        self.saving = false
        self.showDanger(error.message)
        console.log(error)
      })
    },
    
    reset() {
      for(var i in this.witnesses) {
        var wit = this.witnesses[i]
        wit.newVote = JSON.parse(JSON.stringify(wit.vote))
        this.$set(this.witnesses, i, wit)
      }
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },
    
    clearVotes() {
      for(var i in this.witnesses) {
        var wit = this.witnesses[i]
        wit.vote = {approve: false, shares: '0.000000 VESTS'}
        wit.newVote = {approve: false, shares: '0.000000 VESTS'}
        this.$set(this.witnesses, i, wit)
      }      
    },
    
    //validation
    /*validateIssuerName(submit) {
      if (submit && this.issuer_name === "") {
        this.error.issuer_name = true;
        this.errorText.issuer_name = "Issuer name is empty";
        document.getElementById('inputIssuerName').setCustomValidity("invalid");
        return false;
      }
      if (this.issuer_name.length > 200) {
        this.error.issuer_name = true;
        this.errorText.issuer_name = "The issuer name is too long";
        document.getElementById('inputIssuerName').setCustomValidity("invalid");
        return false;
      }
      this.error.issuer_name = false;
      this.errorText.issuer_name = "No error";
      document.getElementById('inputIssuerName').setCustomValidity("");
      return true;
    },*/

    showInfo(msg){
      this.alert.info = true
      this.alertText.info = msg
    },
    
    hideInfo(){
      this.alert.info = false
      this.alertText.info = ''
    },
    
    showSuccess(msg) {
      this.alert.success = true
      this.alertText.success = msg
    },
    
    hideSuccess() {
      this.alert.success = false
      this.alertText.success = ''
    },
    
    showDanger(msg) {
      this.alert.danger = true
      this.alertText.danger = msg
    },
    
    hideDanger() {
      this.alert.danger = false
      this.alertText.danger = ''
    }
  }
};
</script>

<style scoped>

.image-profile {
  display: inline-block;
  height: 2rem;
  width: 2rem;
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  border-radius: 50%;
  vertical-align: middle;
}

.circle {
  border: 2px solid;  
  border-radius: 50%;
  width: 12px;
  height: 12px;  
}

.enabled {
  border-color: green;
}

.disabled {
  border-color: red;
}

.table > tbody > tr > td {
     vertical-align: middle;
}

</style>
