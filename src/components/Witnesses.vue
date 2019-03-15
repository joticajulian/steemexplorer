<template>
  <div>
    <HeaderEFTG portal="OAM Portal" :showAuth="true" ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Witnesses</h2>
      <div v-if="EFTG_HARDFORK_0_1 && this.$store.state.auth.logged" class="text-right mb-3">
        <button class="btn btn-primary" @click="toggleEdit">Edit</button>
      </div>
      <div v-if="witnesses.length > 0">
      <table class="table">
        <thead>
          <tr class="table-primary">
            <th scope="col">#</th>
            <th scope="col">Witness</th>
            <th scope="col">EFTG Power</th>
            <th scope="col">Enabled</th>
            <th scope="col">Version</th>
            <th scope="col">Approval</th>
            <th scope="col">Last Block</th>
            <th scope="col">Miss</th>
            <th scope="col">Vote</th>
            <th scope="col" v-if="editing">Weight</th>
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
              ><router-link :to="EXPLORER+'@'+wit.owner">{{ wit.owner }}</router-link>
            </td>
            <td>{{ wit.steem_power }}</td>
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
            <td v-if="editing">
              <div v-if="wit.showSlider" class="slidecontainer">
                <input type="range" min="0" :max="MAX_VALUE_SLIDER" v-model="wit.slider" class="slider" :id="'slider-'+wit.owner">
                <p class="vests">{{wit.newVote.shares}}</p>
              </div>
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

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import ChainProperties from '@/mixins/ChainProperties.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: "Witnesses",
  
  data() {
    return {
      account: {vesting_shares: '0.000000 VESTS'},
      witnesses: [],
      witnesses2: [],
      witLoaded: false,
      
      saving: false,
      editing: false,
      
      EFTG_HARDFORK_0_1: Config.EFTG_HARDFORK_0_1,
      MAX_VALUE_SLIDER: 10000,
      EXPLORER: Config.EXPLORER,
    };
  },
  
  components: {
    HeaderEFTG    
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
    toggleEdit() {
      this.editing = !this.editing
      
      let self = this
      this.witnesses.forEach(function(wit){ self.handleInputSlider(wit) })
    },
    
    handleInputSlider(wit) {
      if(this.editing) {
        if(wit.showSlider) {
          let self = this
          this.$nextTick(function(){            
            var slider = document.getElementById('slider-'+wit.owner)
            slider.oninput = function() { self.sliderOnChange(this.id) }
          })
        }        
      }
    },
    
    sliderOnChange(inputId) {
      var name = inputId.substring(7) // 'slider-name' take 'name'
      var wit = this.witnesses.find(function(w){ return w.owner === name })
      var vesting_shares = parseFloat(this.account.vesting_shares)
      var wit_shares = vesting_shares * wit.slider / this.MAX_VALUE_SLIDER
      this.$set(wit.newVote, 'shares', wit_shares.toFixed(6) + ' VESTS' )
      
      var total_delta = vesting_shares
      for(var i in this.witnesses) {
        total_delta -= parseFloat(this.witnesses[i].newVote.shares)                
      }      

      var total_shares = vesting_shares - total_delta - wit_shares
      for(var i in this.witnesses) {
        var w = this.witnesses[i]
        if(w.owner === wit.owner) continue // not change the selected witness
        
        var shares = parseFloat(w.newVote.shares)
        var delta = 0
        if(total_shares > 0) {
          delta = total_delta * shares / total_shares
        }
        // todo: adjust fine details (0.000001 VESTS)... what happens if total_shares==0
        var newShares = shares + delta
        this.$set(w.newVote, 'shares', newShares.toFixed(6) + ' VESTS' )
        this.$set(w, 'slider', this.MAX_VALUE_SLIDER * newShares / vesting_shares )        
      }
    },
    
    sliderChange() {
      console.log(this)
      for(var i in this.witnesses) {
        var wit = this.witnesses[i]
        if(wit.slider >  0 && !wit.newVote.approve){
          this.$set(wit.newVote, 'approve', true)
          console.log('approve in ' +wit.owner+ ' = true')
        }  
        if(wit.slider == 0 &&  wit.newVote.approve){
          this.$set(wit.newVote, 'approve', false)
          console.log('approve in ' +wit.owner+ ' = false')
        }
      }
    },

    async loadWitnessesByVote() {
      //var witnessesByVote = await this.client.database.call('get_witnesses_by_vote',['',100])
      var witnessesByVote = await this.steem_database_call('get_witnesses_by_vote',['',100])
      var names =[]

      for(var i in witnessesByVote) names.push(witnessesByVote[i].owner)
      //var accounts = await this.client.database.getAccounts(names)
      var accounts = await this.steem_database_call('get_accounts',[names])

      this.witnesses = []
      for(var i in witnessesByVote) {
        var wit = witnessesByVote[i]
        wit.vote = {approve: false, shares: '0.000000 VESTS'}
        wit.newVote = {approve: false, shares: '0.000000 VESTS'}
        wit.votes_mv = (wit.votes/1000000).toFixed(3)+' V'
        wit.position = parseInt(i)+1
        wit.slider = 0
        wit.showSlider = false
        
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

      if(Config.EFTG_HARDFORK_0_1) {
        var votes = this.account.witness_weight_votes        
      } else {
        var votes = []
        for(var i in this.account.witness_votes)
          votes.push({witness: this.account.witness_votes[i], shares: '0.000000 VESTS'})        
      }

      for(var i in votes) {
        var votedWit = votes[i].witness
        var id = this.witnesses.findIndex(function(w){ return w.owner === votedWit })
        if(id >= 0){
          var wit = this.witnesses[id]
          wit.vote.approve = true
          wit.newVote.approve = true
          
          wit.vote.shares = votes[i].shares
          wit.newVote.shares = votes[i].shares

          wit.slider = parseFloat(votes[i].shares)*this.MAX_VALUE_SLIDER/parseFloat(this.account.vesting_shares)
          wit.showSlider = true

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
      wit.slider = 0
      wit.showSlider = wit.newVote.approve
      
      this.$set(this.witnesses, index, wit)
      
      this.handleInputSlider(wit)
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
      
      var witnesses = this.witnesses.slice()
      witnesses.sort(function(a, b){return parseFloat(a.newVote.shares) - parseFloat(b.newVote.shares)})

      var ops = []
      for(var i in witnesses) {
        var wit = witnesses[i]

        if(Config.EFTG_HARDFORK_0_1) {
          if(wit.newVote.shares !== wit.vote.shares) {
            var operation = [
              'account_witness_weight_vote',
              {
                account: user,
                witness: wit.owner,
                shares: wit.newVote.shares
              }
            ]
            ops.push(operation)
          }
        } else {
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
      //this.client.broadcast.sendOperations(ops,privKey)
      this.steem_broadcast_sendOperations(ops,privKey)
      .then(function(result){
        self.saving = false
        var block = result.block_num
        var trx_id = result.id
        self.showSuccess('<a href="/explorer/b/'+block+'/'+trx_id+'" class="alert-link" target="_blank">Votes saved!</a>')
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
        wit.showSlider = wit.newVote.approve
        wit.slider = parseFloat(wit.vote.shares)*this.MAX_VALUE_SLIDER/parseFloat(this.account.vesting_shares)
        
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
        wit.showSlider = false
        wit.slider = 0
        
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

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: #C3C3C3;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #0F5494;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}

.vests {
  font-family: monospace;
  font-size: 1rem;
  margin: auto;
  text-align: right;
}

</style>
