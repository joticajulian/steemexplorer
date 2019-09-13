<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Proposals</h2>
      <div v-if="steemdao.name">Total fund: {{steemdao.sbd_balance}}</div>
      <div v-if="steemdao.name">Daily budget: {{steemdao.daily_budget}}</div>
      <div v-if="steemdao.name">Budget for the next hour: {{steemdao.hourly_budget}}</div>
      <div class="row mb-3">
        <div class="col-12 text-right">
          <select v-model="sort_order">
            <option value="votes">Sort by votes</option>
            <option value="start_date">Sort by start date</option>
            <option value="end_date">Sort by end date</option>
            <option value="total_days">Sort by total days</option>
            <option value="id">Sort by id</option>
            <option value="status">Sort by status</option>
            <option value="creator">Sort by creator</option>
            <option value="receiver">Sort by receiver</option>
            <option value="daily_pay">Sort by daily pay</option>
            <option value="total_pay">Sort by total pay</option>
          </select>
        </div>
      </div>
      <div class="card mb-2">
        <ul class="list-group list-group-flush">
          <li v-for="(p,index) in proposals" :key="index" class="list-group-item" @click="selectProposal(index)">
            <div class="row">
              <div class="col-3">
                <div class="image-profile mr-2" :style="{ backgroundImage: 'url(' + p.image + ')' }"></div>
                <span>{{p.creator}} <span v-if="p.creator !== p.receiver">(receiver @{{p.receiver}})</span></span>
                <div><router-link :to="p.url">{{p.subject}}</router-link></div>
                <div><small>id #{{p.id}}</small><span class="badge ml-2" :class="{'badge-primary':p.active,'badge-warning':!p.active}">{{p.status}}</span> </div>
              </div>
              <div class="col-4">From {{p.start_date}} to {{p.end_date}} ({{p.total_time}})</div>
              <div class="col-2">{{p.daily_pay}} daily</div>
              <div class="col-2">{{p.votes_sp}}</div>
              <div class="col-1">
                <button class="btn" v-on:click.stop="toggleVote(index)" :class="{'btn-primary':p.newVote, 'btn-secondary':!p.newVote}">
                  <font-awesome-icon icon="check"/>
                </button>
              </div>
            </div>
          </li>
        </ul>
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
import HeaderEFTG from '@/components/HeaderEFTG'
import SteemClient from '@/mixins/SteemClient.js'
import Alerts from '@/mixins/Alerts.js'
import Utils from '@/js/utils.js'
import router from '@/router.js'

import Config from '@/config.js'
import ChainProperties from '@/mixins/ChainProperties.js'


export default {
  name: 'ProposalsPage',
  
  data() {
    return {
      proposals: [],
      sort_order: 'votes',
      steemdao: {},
      saving: false
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    ChainProperties,
    SteemClient,
    Alerts
  ],

  created() {
    this.getChainProperties().then( ()=>{
      this.getProposals()
    })
  },

  watch: {
    sort_order: function(new_order){ this.sortBy(new_order) },
  },

  methods: {
    async getSteemDao(){
      try{
        var accounts = await this.steem_database_call('get_accounts',[['steem.dao']])
        this.steemdao = accounts[0]
        this.steemdao.daily_budget = (parseFloat(this.steemdao.sbd_balance)/100).toFixed(3) + ' ' + Config.SBD
        this.steemdao.hourly_budget = (parseFloat(this.steemdao.sbd_balance)/(24*100)).toFixed(3) + ' ' + Config.SBD
      }catch(error){
        this.showDanger('Problems loading steem.dao')
        throw error
      }
    },

    async getProposals(){
      console.log('get')
      this.proposals = []
      await this.getSteemDao()
      var proposals = await this.steem_database_call('list_proposals',[['',0],100,'by_creator'])
      for(var i in proposals){
        var p = proposals[i]
        var delta_t = new Date(p.end_date) - new Date(p.start_date)
        p.url = Config.EXPLORER + '@' + p.creator + '/' + p.permlink
        p.image = 'https://steemitimages.com/u/'+p.creator+'/avatar/small'
        p.votes_sp = this.witnessVotes2sp(p.total_votes)
        p.vote = false
        p.newVote = false
        p.total_time = Utils.textTime(delta_t)
        p.total_pay = (parseFloat(p.daily_pay) * delta_t / (1000*60*60*24)).toFixed(3) + ' ' + Config.SBD
        p.active = this.isActive(p)
        p.status = p.active ? 'active' : 'inactive'
        this.proposals.push(p)
      }
      this.sortBy(this.sort_order)
      if(this.$store.state.auth.logged) this.loadVotesFromAccount()
      this.loadVotesNoActive()
    },

    sortBy(type){
      switch(type){
        case 'votes':
          this.proposals.sort( (a,b)=>{ return parseInt(b.total_votes) - parseInt(a.total_votes) })
          return
        case 'start_date':
          this.proposals.sort( (a,b)=>{ return new Date(a.start_date) - new Date(b.start_date) })
          return
        case 'end_date':
          this.proposals.sort( (a,b)=>{ return new Date(a.end_date) - new Date(b.end_date) })
          return
        case 'total_days':
          this.proposals.sort( (a,b)=>{ return (new Date(b.end_date) - new Date(b.start_date))
                                              -(new Date(a.end_date) - new Date(a.start_date)) })
          return
        case 'creator':
          this.proposals.sort( (a,b)=>{ return a.creator.localeCompare(b.creator) })
          return
        case 'receiver':
          this.proposals.sort( (a,b)=>{ return a.receiver.localeCompare(b.receiver) })
          return
        case 'daily_pay':
          this.proposals.sort( (a,b)=>{ return parseFloat(b.daily_pay) - parseFloat(a.daily_pay) })
          return
        case 'total_pay':
          this.proposals.sort( (a,b)=>{ return (new Date(b.end_date) - new Date(b.start_date)) * parseFloat(b.daily_pay)
                                              -(new Date(a.end_date) - new Date(a.start_date)) * parseFloat(a.daily_pay) })
          return
        case 'status':
          this.proposals.sort( (a,b)=>{
            var activeA = this.isActive(a)
            var activeB = this.isActive(b)
            if( activeA == activeB ) return parseInt(b.total_votes) - parseInt(a.total_votes) //sort by votes
            if( activeA && !activeB ) return -1
            if( !activeA && activeB ) return 1
          })
          return
        case 'id':
          this.proposals.sort( (a,b)=>{ return parseInt(a.id) - parseInt(b.id) })
          return
        default:
          throw new Error(`The type '${type}' for sort does not exists`)
      }
    },

    isActive(proposal){
      var now = Date.now()
      return now <= new Date(proposal.end_date+'Z') && now >= new Date(proposal.start_date+'Z')
    },

    /**
     * ISSUE: https://github.com/steemit/steem/issues/3488
     * This call is not necessary after this issue is solved
     */ 
    async loadVotesNoActive(){
      for(var i in this.proposals){
        var proposal = this.proposals[i]
        if(this.isActive(proposal)) continue
        proposal.total_votes = 0
        var from = ''
        var break_while = false
        var voters = []
        while(!break_while){
          var votes = await this.steem_database_call('list_proposal_votes',[[proposal.id,from],100,'by_proposal_voter'])
          if(votes.length == 0) break
          console.log(`Votes: length: ${votes.length}. from '${votes[0].voter}' to '${votes[votes.length-1].voter}'`)

          if(votes.length == 1){
            break_while = true
            if(votes[0].proposal.id == proposal.id) voters.push(votes[0].voter)
          }else{
            for(var j=0; j<votes.length-1; j++){ //don't take the last one. It is for the next round
              if(votes[j].proposal.id !== proposal.id){
                break_while = true
                break
              }
              voters.push(votes[j].voter) 
            }
          }
          from = votes[votes.length-1].voter
        }
        console.log(`voters of id ${proposal.id}`)
        console.log(voters)
        var accounts = await this.steem_database_call('get_accounts',[voters])
        for(var j in accounts){
          proposal.total_votes += parseInt(this.witness_vote_weight(accounts[j]))
        }
        console.log(`total votes ${proposal.total_votes}`)
        proposal.votes_sp = this.witnessVotes2sp(proposal.total_votes)
        this.$set(this.proposals, i, proposal)
      }
      this.sortBy(this.sort_order)
    },

    witness_vote_weight(account) {
      var total = Math.floor(parseFloat(account.vesting_shares)*1e6)
      for(var i in account.proxied_vsf_votes)
        total += parseInt(account.proxied_vsf_votes[i])
      return total
    },

    async loadVotesFromAccount(){
      var user = this.$store.state.auth.user
      this.clearVotes()
      var account_votes = await this.steem_database_call('list_proposal_votes',[[user,0],100,'by_voter_proposal'])
      var proposalsNotTop = []
      for(var i in account_votes){
        var vote = account_votes[i]
        if(vote.voter !== user) break
        var index = this.proposals.findIndex( (p)=>{ return p.id === vote.proposal.id })
        if(index >= 0){
          var proposal = this.proposals[index]
          proposal.vote = true
          proposal.newVote = true
          this.$set(this.proposals, index, proposal)
        }else{
          proposalsNotTop.push(vote)
        }
      }
      if(proposalsNotTop.length > 0) {
        console.log('TODO: these proposals are already voted but they are not in the TOP list:')
        console.log(proposalsNotTop)
      }
    },

    selectProposal(index){
      var proposal = this.proposals[index]
      router.push({ name: 'Proposal', params:{id:proposal.id} })
    },

    toggleVote(index){
      var p = this.proposals[index]
      p.newVote = !p.newVote
      this.$set(this.proposals, index, p)
    },

    save(){
      var user = this.$store.state.auth.user
      var activeKey = this.$store.state.auth.keys.active
      var ownerKey  = this.$store.state.auth.keys.owner
      var privKey = null

      if( activeKey != null ) {
        privKey = activeKey
      }else if(ownerKey != null ) {
        privKey = ownerKey 
      }else {
        this.showDanger('Please login with master, owner, or active key')
        return 
      }

      var proposals = this.proposals.slice()

      var approve_id_proposals = []
      var unapprove_id_proposals = []
      for(var i in proposals) {
        var p = proposals[i]

        if(p.newVote != p.vote) {
          if(p.newVote === true) approve_id_proposals.push(p.id)
          else unapprove_id_proposals.push(p.id)
        }
      }

      if(approve_id_proposals.length == 0 && unapprove_id_proposals.length == 0) {
        this.showDanger('Nothing to change')
        return
      }

      var ops = []
      approve_id_proposals.sort( (a,b)=>{return a-b})
      unapprove_id_proposals.sort( (a,b)=>{return a-b})

      var j=0
      for(var i=0; i<approve_id_proposals.length; i++){
        if(j%Config.STEEM_PROPOSAL_MAX_IDS_NUMBER == 0){
          ops.push([
            'update_proposal_votes',
            {
              voter: user,
              proposal_ids: [],
              approve: true,
              extensions: []
            }
          ])
        }
        ops[ops.length-1][1].proposal_ids.push( approve_id_proposals[i] )
        j++
      }

      var j=0
      for(var i=0; i<unapprove_id_proposals.length; i++){
        if(j%Config.STEEM_PROPOSAL_MAX_IDS_NUMBER == 0){
          ops.push([
            'update_proposal_votes',
            {
              voter: user,
              proposal_ids: [],
              approve: false,
              extensions: []
            }
          ])
        }
        ops[ops.length-1][1].proposal_ids.push( unapprove_id_proposals[i] )
        j++
      }

      this.saving = true
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()

      let self = this

      this.steem_broadcast_sendOperations(ops,privKey)
      .then(function(result){
        self.saving = false
        self.showSuccess(`<a href="${Config.EXPLORER2}b/${result.block_num}/${result.id}" class="alert-link" target="_blank">Votes saved!</a>`)
        self.loadVotesFromAccount()
      })
      .catch(function(error){
        self.saving = false
        self.showDanger(error.message)
        console.log('operations')
        console.log(ops)
        throw error
      })
    },

    reset(){
      for(var i in this.proposals) {
        var p = this.proposals[i]
        p.newVote = JSON.parse(JSON.stringify(p.vote))
        this.$set(this.proposals, i, p)
      }
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },

    clearVotes() {
      for(var i in this.proposals) {
        var p = this.proposals[i]
        p.vote = false
        this.$set(this.proposals, i, p)
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
  }
}
</script>

<style scoped>

.hash {
  font-family: monospace;
  //font-size: 1.3rem;
  overflow-wrap: break-word;
}

</style>
