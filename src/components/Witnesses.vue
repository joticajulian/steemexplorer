<template>
  <div>
    <HeaderEFTG portal="OAM Portal" :showAuth="true" ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Witnesses</h2>
      <div v-if="witnesses.length > 0">
      <table class="table">
        <thead>
          <tr class="table-primary">
            <th scope="col">#</th>
            <th scope="col">Witness</th>
            <th scope="col">Enabled</th>
            <th scope="col">Account Creation Fee</th>
            <!-- <th scope="col">Version</th> -->
            <th scope="col">Approval</th>
            <th scope="col">Last Block</th>
            <th scope="col">Miss</th>
            <th scope="col">Since</th>
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
              ><div v-bind:style="{ backgroundImage: 'url(' + wit.imgUrl.replace('\'','').replace('\'','') + ')' }" class="image-profile mr-2"                  
              ></div>
              <router-link :to="EXPLORER+'@'+wit.owner">{{ wit.owner }}</router-link>
            </td>
            <td><div class="circle" :class="{enabled:wit.enabled, disabled:!wit.enabled}"></div></td>
            <!-- <td>{{ wit.running_version }}</td> -->
            <td>{{ wit.props.account_creation_fee }}</td>
            <td>{{ wit.votes_sp }}</td>
            <td>{{ wit.last_confirmed_block_num }}</td>
            <td>{{ wit.total_missed }}</td>
            <td>{{ new Date(wit.created).toLocaleDateString('en-us') }}</td>
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
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>
      <div v-if="this.$store.state.auth.logged" class="row mt-4">
        <div class="form-group col-12">
          <button @click="save" class="btn btn-primary btn-large mr-2" :disabled="saving"><div v-if="saving" class="mini loader"></div>Save</button>
          <button @click="reset" class="btn btn-secondary btn-large">Reset</button>
        </div>            
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>    
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import { Client } from 'eftg-dsteem'
import SteemClient from '@/mixins/SteemClient.js'

import { TimeAgo } from "vue2-timeago";
import "vue2-timeago/dist/vue2-timeago.css";

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import ChainProperties from '@/mixins/ChainProperties.js'
import HeaderEFTG from '@/components/HeaderEFTG'

import * as sereyjs from '@sereynetwork/sereyjs';
sereyjs.api.setOptions({ url: 'wss://api.serey.io' }); // assuming websocket is working at ws.golos.io
sereyjs.config.set('address_prefix','SRY');

let opts = {}
opts.addressPrefix = 'SRY';
opts.timeout = Config.DSTEEM_TIMEOUT
opts.chainId = '5205c25d3e87cb3e8e527e6fbbf324b7b2b9fe7a7192c604ce5b174d08987324';
// if(Config.STEEM_CHAIN_ID) opts.chainId = Config.STEEM_CHAIN_ID
import { Client as Client2 } from 'dsteem'
const sereyClient = new Client2('https://api.serey.io', opts);

  // return new Client(address, opts)

export default {
  name: "Witnesses",
  
  data() {
    return {
      account: {vesting_shares: '0.000000 VESTS'},
      witnesses: [],
      witnesses2: [],
      witLoaded: false,
      
      saving: false,
      
      EXPLORER: Config.EXPLORER,
      EXPLORER2: Config.EXPLORER2,
    };
  },
  
  components: {
    HeaderEFTG,
    TimeAgo
  },
  mixins: [
    ChainProperties,
    SteemClient
  ],
  
  created() {
    this.getChainProperties().then( ()=> {
      this.loadWitnessesByVote()
    })
  },

  methods: {
    async loadWitnessesByVote() {
      //var witnessesByVote = await this.client.database.call('get_witnesses_by_vote',['',100])
      var witnessesByVote = await this.steem_database_call('get_witnesses_by_vote',['',100])
      console.log('witnesss by vote', witnessesByVote[0]);
      var names =[]

      for(var i in witnessesByVote) names.push(witnessesByVote[i].owner)
      //var accounts = await this.client.database.getAccounts(names)
      var accounts = await this.steem_database_call('get_accounts',[names])

      this.witnesses = []
      for(var i in witnessesByVote) {
        var wit = witnessesByVote[i]
        console.log(wit);
        console.log(wit.imgUrl);
        wit.vote = {approve: false, shares: '0.000000 VESTS'}
        wit.newVote = {approve: false, shares: '0.000000 VESTS'}
        wit.votes_sp = this.witnessVotes2sp(wit.votes)
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
        wit.steem_power = this.vests2sp(accounts[i].vesting_shares)
        this.witnesses.push(wit)
      }
      this.witLoaded = true
      if(this.$store.state.auth.logged) await this.loadVotesFromAccount()
    },
    
    async loadVotesFromAccount() {
      if(!this.witLoaded) return

      var namesWitnessesNotTop = []

      //var accounts = await this.client.database.getAccounts([this.$store.state.auth.user])
      var accounts = await this.steem_database_call('get_accounts',[[this.$store.state.auth.user]])
      this.account = accounts[0]

      this.clearVotes()

      var votes = []
      for(var i in this.account.witness_votes)
        votes.push({witness: this.account.witness_votes[i], shares: '0.000000 VESTS'})        

      for(var i in votes) {
        var votedWit = votes[i].witness
        var id = this.witnesses.findIndex(function(w){ return w.owner === votedWit })
        if(id >= 0){
          var wit = this.witnesses[id]
          wit.vote.approve = true
          wit.newVote.approve = true
          
          wit.vote.shares = votes[i].shares
          wit.newVote.shares = votes[i].shares

          this.$set(this.witnesses, id, wit)
        } else { 
          namesWitnessesNotTop.push(votedWit)
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
      wit.newVote.shares = '0.000000 VESTS'

      this.$set(this.witnesses, index, wit)
    },
    
    save() {
      var user = this.$store.state.auth.user
      var activeKey = this.$store.state.auth.keys.active
      var ownerKey  = this.$store.state.auth.keys.owner
      var pass = this.$store.state.auth.pass;

      // var privKey = null;
      // if( activeKey != null ) {
      //   privKey = activeKey
      // }else if(ownerKey != null ) {
      //   privKey = ownerKey 
      // }else {
      if(!pass) {
        this.showDanger('Please login with master, owner, or active key')
      }
        // return        
      // }
      
      var witnesses = this.witnesses.slice()
      witnesses.sort(function(a, b){return parseFloat(a.newVote.shares) - parseFloat(b.newVote.shares)})

      var ops = []
      for(var i in witnesses) {
        var wit = witnesses[i]

        if(wit.newVote.approve != wit.vote.approve) {
          console.log(wit);
          // var operation = [
          //   'account_witness_vote',
          //   {
          //     account: user,
          //     witness: wit.owner,
          //     approve: wit.newVote.approve
          //   }
          // ]
          var operation = {
            account: user,
            witness: wit.owner,
            approve: wit.newVote.approve
          }
          // sereyjs.broadcast.send({extensions: [], operations: [operation]}, [privKey], (err,result) => {
          //   console.log('err', err, result);
          // });
          // console.log(user);
          // console.log(privKey);
          // console.log(activeKey);
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

      
      for(var op of ops) {
        sereyjs.broadcast.accountWitnessVote(pass, op.account, op.witness, op.approve, (err, result) => {
          console.log('Result', err, result);
        });
      }

      self.saving = false
      this.saving = false;
        // var block = result.block_num
        // var trx_id = result.id
      // self.showSuccess('Witness Votes updated');
      window.alert('Witness Votes update success. Please refresh page !')
        // self.showSuccess(`<a href="${Config.EXPLORER2}b/${block}/${trx_id}" class="alert-link" target="_blank">Votes saved!</a>`)
      self.loadVotesFromAccount()

      // ops.forEach(op => {
      //   sereyjs.broadcast.accountWitnessVote(pass, op.account, op.witness, op.approve, (err, result) => {
      //     console.log('Result', err, result);
      //   });
      // })

      // // this.client.broadcast.sendOperations(ops,privKey)
      // // this.steem_broadcast_sendOperations(ops,privKey)
      // console.log(sereyjs.broadcast.sendOperations);
      // console.log(sereyjs.broadcast);
      // // sereyjs.broadcast.sendOperations(ops, privKey)

      // // sereyjs.send(ops, [privKey], function(result, error) {
      // //   console.log('result', result, error);
      // // })

      // sereyjs.send(ops, privKey)
      // // sereyClient.broadcast.sendOperations(ops, privKey)
      // // sereyjs.broadcast.sendOperations(ops, privKey)
      // // // sereyjs.broadcast.accountWitnessVote(wif, account, witness, approve)
      // .then(function(result){
      //   self.saving = false
      //   var block = result.block_num
      //   var trx_id = result.id
      //   self.showSuccess(`<a href="${Config.EXPLORER2}b/${block}/${trx_id}" class="alert-link" target="_blank">Votes saved!</a>`)
      //   self.loadVotesFromAccount()
      // })
      // .catch(function(error){
      //   self.saving = false
      //   self.showDanger(error.message)
      //   console.log(error)
      // })
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

.table {
  border: 1px solid #ddd;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

.vests {
  font-family: monospace;
  font-size: 1rem;
  margin: auto;
  text-align: right;
}

.timeago {
  margin-top: 50px;
  border: 2px solid #47b784;
  padding: 10px;
}
.timeago span {
  font-size: 15px;
}

.ago {
  width: auto;
}

</style>
