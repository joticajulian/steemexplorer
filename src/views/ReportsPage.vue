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
          <div>Median payout: {{posts.median_payout}} SBD</div>
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
    this.selectDay( this.days[0] )
    /*this.getChainProperties().then( ()=>{
      this.selectDay( this.days[0] )
    })*/
  },

  watch: {
  },
  
  methods: {
    async selectDay(day){
      try{
        var doc = await this.db.collection('daily_reports').doc(day).get()
        var doc_gprops = await this.db.collection('daily_global_props').doc(day).get()
        if (!doc.exists){
          console.log(`There is no data for ${day}`);
          return
        }
        if (!doc_gprops.exists){
          console.log(`No global props for ${day}. Taking from 2019-12-26`)
          doc_gprops = await this.db.collection('daily_global_props').doc('2019-12-26').get()
          if (!doc_gprops.exists){
            console.log(`Sorry. No global props for 2019-12-26`)
          }
        }
        var data = doc.data()
        var gprops = doc_gprops.data()
        var s = 2e12
        gprops.feed_price = parseFloat(gprops.feed.base) / parseFloat(gprops.feed.quote)
        gprops.reward_balance = parseFloat(gprops.reward_balance)
        gprops.recent_claims = parseInt(gprops.recent_claims)

        var div = data.post.total_claims / data.post.total_rshares
        var mrs = 2*s * (2*div - 1)/(1 - div)  // median rshares
        var mcl = mrs * (mrs + 2*s) / (mrs + 4*s) // median claims
        this.posts.median_payout = (mcl * gprops.reward_balance / gprops.recent_claims * gprops.feed_price).toFixed(3)

        data.post.y2 = []
        data.post.bgc = []
        var median_bar_done = false
        for(var i in data.post.x){
          var rs = data.post.x[i]
          var claims = rs * (rs + 2*s) / (rs + 4*s)
          var steem = gprops.reward_balance / gprops.recent_claims * claims
          var sbd = steem * gprops.feed_price
          data.post.x[i] = '$ ' + sbd.toFixed(3)
          data.post.y[i] = Math.round(data.post.y[i] * sbd * 100)/100
          if(!median_bar_done && rs > mrs){
            data.post.bgc[i] = '#0546b5'
            median_bar_done = true
          }else{
            data.post.bgc[i] = '#3c8dbc'
          }
        }
        this.bardata = {
          labels: data.post.x,
          datasets:[{
            label: 'SBD Paid - Posts',
            backgroundColor: data.post.bgc,
            data:data.post.y
          }]
        }
      }catch(error){
        console.log("Error getting document:", error)
      }
    },
    loadMoreDays(){},
    onLogin(){},
    onLogout(){}
  }
}
</script>

<style scoped>
</style>
