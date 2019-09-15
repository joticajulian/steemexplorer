<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>{{proposal.subject}}</h2>
      <div class="row mt-3 mb-2">
        <div class="col-2">Creator</div>
        <div class="col-10">
          <div class="image-profile mr-2" :style="{ backgroundImage: 'url(' + proposal.image + ')' }"></div>
          <span>{{proposal.creator}}</span>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Receiver</div>
        <div class="col-10">
          <div class="image-profile mr-2" :style="{ backgroundImage: 'url(' + proposal.image_receiver + ')' }"></div>
          <span>{{proposal.receiver}}</span>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Subject</div>
        <div class="col-10">
          <router-link :to="proposal.url">{{proposal.subject}}</router-link>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Start date</div>
        <div class="col-10">{{proposal.start_date}}</div>
      </div>
      <div class="row mb-2">
        <div class="col-2">End date</div>
        <div class="col-10">{{proposal.end_date}}</div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Total days</div>
        <div class="col-10">{{proposal.total_time}}</div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Daily pay</div>
        <div class="col-10">{{proposal.daily_pay}}</div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Total pay</div>
        <div class="col-10">{{proposal.total_pay}}</div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Status</div>
        <div class="col-10">{{proposal.status}} {{proposal.status_extended}}</div>
      </div>
      <div class="row mb-2">
        <div class="col-2">Votes</div>
        <div class="col-10">{{proposal.votes_sp}}</div>
      </div>
      <div v-if="this.$store.state.auth.logged" class="row mt-4">
        <div class="form-group col-12">
          <button @click="vote" class="btn btn-primary btn-large mr-2" :disabled="saving"><div v-if="saving" class="mini loader"></div>{{display_button}}</button>
        </div>
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>

      <h3 class="mt-5">{{votes.length}} Votes</h3>
      <div class="row mb-3">
        <div class="col-12 text-right">
          <select v-model="sort_order">
            <option value="votes">Sort by votes</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
      </div>
      <div class="card mb-2">
        <ul class="list-group list-group-flush">
          <li v-for="(vote,index) in votes" :key="index" class="list-group-item">
            <div class="row">
              <div class="col-3">@{{vote.voter}}</div>
              <div class="col-2">{{vote.votes_no_proxy_sp}}</div>
              <div class="col-7">{{vote.votes_proxy_sp}}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'
import SteemClient from '@/mixins/SteemClient.js'
import Alerts from '@/mixins/Alerts.js'
import Utils from '@/js/utils.js'

import Config from '@/config.js'
import ChainProperties from '@/mixins/ChainProperties.js'


export default {
  name: 'ProposalPage',

  data() {
    return {
      proposal: {url:''},
      votes: [],
      sort_order: 'votes',
      display_button: 'Vote',
      saving: false,
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
      this.getProposal()
    })
  },

  watch: {
    sort_order: function(new_order){ this.sortBy(new_order) },
  },

  methods: {
    async getProposal(){
      var id = this.$route.params.id
      var proposals = await this.steem_database_call('find_proposals',[[id]])
      console.log(proposals)
      if(!proposals || proposals.length==0){
        this.showDanger(`Proposal number #${id} does not exists`)
        throw new Error(`Proposal number #${id} does not exists`)
      }
      var proposal = proposals[0]
      var delta_t = new Date(proposal.end_date) - new Date(proposal.start_date)
      proposal.url = Config.EXPLORER + '@' + proposal.creator + '/' + proposal.permlink
      proposal.image = 'https://steemitimages.com/u/'+proposal.creator+'/avatar/small'
      proposal.image_receiver = 'https://steemitimages.com/u/'+proposal.receiver+'/avatar/small'
      proposal.votes_sp = this.witnessVotes2sp(proposal.total_votes)
      proposal.vote = false
      proposal.newVote = false
      proposal.total_time = Utils.textTime(delta_t)
      proposal.total_pay = (parseFloat(proposal.daily_pay) * delta_t / (1000*60*60*24)).toFixed(3) + ' ' + Config.SBD
      proposal.active = this.isActive(proposal)
      proposal.status = proposal.active ? 'active' : 'inactive'
      if(proposal.active){
        proposal.status = 'active'
        proposal.status_extended = ''
      }else{
        proposal.status = 'inactive'
        proposal.status_extended = `(becomes active in ${Utils.textTime(new Date(proposal.start_date+'Z') - Date.now())})`
      }
      this.proposal = proposal
      console.log(`total votes ${proposal.total_votes}`)

      if(this.$store.state.auth.logged) this.loadVotesFromAccount()
      this.loadVotes()
    },

    sortBy(type){
      switch(type){
        case 'votes':
          this.votes.sort( (a,b)=>{ return parseInt(b.votes) - parseInt(a.votes) })
          return
        case 'name':
          this.votes.sort( (a,b)=>{ return a.voter.localeCompare(b.voter) })
          return
        default:
          throw new Error(`The type '${type}' for sort does not exists`)
      }
    },

    isActive(proposal){
      var now = Date.now()
      return now <= new Date(proposal.end_date+'Z') && now >= new Date(proposal.start_date+'Z')
    },

    async loadVotes(){
      var proposal = this.proposal
      proposal.total_votes = 0
      var from = ''
      var break_while = false
      var voters = []
      while(!break_while){
        var votes = await this.steem_database_call('list_proposal_votes',[[proposal.id,from],100,'by_proposal_voter'])

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
      this.votes = []
      var accounts = await this.steem_database_call('get_accounts',[voters])
      for(var j in accounts){
        var vote = {
          voter: accounts[j].name,
          votes: this.witness_vote_weight(accounts[j]),
          no_proxy_votes: this.no_proxy_vote_weight(accounts[j]),
          proxy_votes: this.proxy_vote_weight(accounts[j]),
        }
        vote.votes_no_proxy_sp = this.witnessVotes2sp(vote.no_proxy_votes)
        if(vote.proxy_votes > 0)
          vote.votes_proxy_sp = '+ ' + this.witnessVotes2sp(vote.proxy_votes) + ' proxy'
        else
          vote.votes_proxy_sp = ''
        this.votes.push(vote)
        proposal.total_votes += (vote.no_proxy_votes + vote.proxy_votes)
      }
      console.log(`total votes ${proposal.total_votes}`)
      proposal.votes_sp = this.witnessVotes2sp(proposal.total_votes)
      this.proposal = proposal
      this.sortBy(this.sort_order)
    },

    witness_vote_weight(account) {
      return this.no_proxy_vote_weight(account) + this.proxy_vote_weight(account)
    },

    no_proxy_vote_weight(account){
      if(account.proxy !== '') return 0
      return Math.floor(parseFloat(account.vesting_shares)*1e6)
    },

    proxy_vote_weight(account) {
      if(account.proxy !== '') return 0
      var total = 0
      for(var i in account.proxied_vsf_votes)
        total += parseInt(account.proxied_vsf_votes[i])
      return total
    },

    async loadVotesFromAccount(){
      var user = this.$store.state.auth.user
      var id = this.$route.params.id
      this.clearVotes()
      var account_votes = await this.steem_database_call('list_proposal_votes',[[user,id],1,'by_voter_proposal'])
      if(!account_votes || account_votes.length==0){
        this.proposal.vote = false
        this.display_button = 'Vote'
      }else{
        this.proposal.vote = true
        this.display_button = 'Remove vote'
      }
    },

    vote(){
      var user = this.$store.state.auth.user
      var activeKey = this.$store.state.auth.keys.active
      var ownerKey  = this.$store.state.auth.keys.owner
      var privKey = null
      var id = this.$route.params.id

      if( activeKey != null ) {
        privKey = activeKey
      }else if(ownerKey != null ) {
        privKey = ownerKey
      }else {
        this.showDanger('Please login with master, owner, or active key')
        return
      }

      var ops = [[
        'update_proposal_votes',
        {
          voter: user,
          proposal_ids: [id],
          approve: !this.proposal.vote,
          extensions: []
        }
      ]]

      this.saving = true
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()

      let self = this

      this.steem_broadcast_sendOperations(ops,privKey)
      .then(function(result){
        self.saving = false
        self.showSuccess(`<a href="${Config.EXPLORER2}b/${result.block_num}/${result.id}" class="alert-link" target="_blank">Vote saved!</a>`)
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

    onLogin() {
      this.loadVotesFromAccount()
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },

    onLogout() {
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
