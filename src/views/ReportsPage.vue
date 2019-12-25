<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Reports</h2>
      <div class="row">
        <div class="col-md-2">
          <ul class="list-group list-group-flush">
            <li v-for="(day, index) in days" :key="index" class="list-group-item" @click="selectDay(day)">
              <span>{{day}}</span>
            </li>
          </ul>
          <div v-if="there_are_more_days" class="mt-2 text-center">
            <button class="btn btn-primary" @click="loadMoreDays">More</button>
          </div>
        </div>
        <div class="col-md-10">
          <BarChart :chartData="bardata" :options="options"></BarChart>
          <div>Total rshares: {{posts.total_rshares}}</div>
          <div>Total claims: {{posts.total_claims}}</div>
          <div>Relation: {{posts.claims_per_rshare}}</div>
          <div>Average payout: {{posts.average_payout}} SBD</div>
        </div>
      </div>
    </div>    
  </div>
</template>

<script>
import firebase from 'firebase'
import HeaderEFTG from '@/components/HeaderEFTG'
import SteemClient from '@/mixins/SteemClient.js'

import Config from '@/config.js'
import ChainProperties from '@/mixins/ChainProperties.js'
import BarChart from '@/components/BarChart'

export default {
  name: 'ReportsPage',
  
  data() {
    return {
      there_are_more_days: false,
      days: [],
      db: null,
      bardata: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false
      },
      posts: {
        total_rshares: 0,
        total_claims: 0,
        rshares_per_claim: 0
      },
    }
  },

  components: {
    HeaderEFTG,
    BarChart
  },

  mixins: [
    ChainProperties,
    SteemClient,
  ],

  created() {
    var time = Date.now()
    this.days = []
    for(var i=0; i<7; i++){
      this.days.push(new Date(time).toISOString().slice(0,-14))
      time -= 24*60*60*1000
    }
    if(time > new Date('2019-11-21T00:00:00Z'))
      this.there_are_more_days = true
    if(firebase.apps.length == 0){
      firebase.initializeApp({
        apiKey: 'AIzaSyDK86eQUpJK4d717rQxw8NUzu_u3w2c9Vw',
        authDomain: 'steem-states-bot.firebaseapp.com',
        projectId: 'steem-states-bot'
      })
    }
    this.db = firebase.firestore()
    this.getChainProperties().then( ()=>{
      this.selectDay( this.days[0] )
    })
  },

  watch: {
  },
  
  methods: {
    selectDay(day){
      let self = this
      this.db.collection('daily_reports').doc(day).get()
        .then(function(doc){
          if (doc.exists) {
            var data = doc.data()
            var s = 2e12
            if(!data.reward_balance || !data.recent_claims){
              data.reward_balance = self.chain.reward_balance
              data.recent_claims = self.chain.recent_claims
            }
            if(!data.feed_price)
              data.feed_price = self.chain.feed_price
            for(var i in data.post.x){              
              var rs = data.post.x[i]
              var claims = rs * (rs + 2*s) / (rs + 4*s)
              var steem = data.reward_balance / data.recent_claims * claims
              var sbd = steem * data.feed_price
              data.post.x[i] = '$ ' + sbd.toFixed(3)
            }
            self.bardata = {
              labels: data.post.x,
              datasets:[{
                label: 'Posts',
                backgroundColor: '#3c8dbc',
                data:data.post.y
              }]
            }
            self.posts.total_rshares = data.post.total_rshares
            self.posts.total_claims = data.post.total_claims
            self.posts.claims_per_rshare = data.post.total_claims / data.post.total_rshares
            var div = self.posts.claims_per_rshare
            var ars = 2*s * (2*div - 1)/(1 - div)  // average rshares
            var acl = ars * (ars + 2*s) / (ars + 4*s) // average claims
            self.posts.average_payout = (acl * data.reward_balance / data.recent_claims * data.feed_price).toFixed(3)
          } else {
            console.log(`There is no data for ${day}`);
          }
        })
        .catch(function(error) {
          console.log("Error getting document:", error)
        })
    },
    loadMoreDays(){},
    onLogin(){},
    onLogout(){}
  }
}
</script>

<style scoped>
</style>
