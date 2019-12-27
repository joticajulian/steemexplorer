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
          <div>Budget for rewards: {{dayprops.budget}} STEEM</div>
          <div>Total rewards for posts: {{dayprops.reward_posts}} STEEM ({{dayprops.perc_reward_posts}}%)</div>
          <div>Total rewards for comments: {{dayprops.reward_comments}} STEEM ({{dayprops.perc_reward_comments}}%)</div>
          <div>Median payout: {{dayprops.median_payout}} SBD</div>
          <div class="row">
            <div class="col-md-6">
          <BarChart :chartData="chartPostSBD" :options="options"></BarChart>
          <BarChart :chartData="chartPostFreq" :options="options"></BarChart>
          </div>
<div class="col-md-6">
          <BarChart :chartData="chartCommentSBD" :options="options"></BarChart>
          <BarChart :chartData="chartCommentFreq" :options="options"></BarChart>
          </div>
      </div>
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
      chartPostSBD: { labels: [], datasets: [] },
      chartPostFreq: { labels: [], datasets: [] },
      chartCommentSBD: { labels: [], datasets: [] },
      chartCommentFreq: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false
      },
      dayprops: {
        budget: 0,
        reward_posts: 0,
        reward_comments: 0,
        perc_reward_posts: 0,
        perc_reward_comments: 0,
        median_payout: 0
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
        this.dayprops.median_payout = (mcl * gprops.reward_balance / gprops.recent_claims * gprops.feed_price).toFixed(3)
        gprops.mrs = mrs

        this.dayprops.budget = Math.round(gprops.reward_balance / 15 * 1000)/1000
        this.dayprops.reward_posts = Math.round(data.post.total_claims * gprops.reward_balance / gprops.recent_claims * 1000)/1000
        this.dayprops.reward_comments = Math.round(data.comment.total_claims * gprops.reward_balance / gprops.recent_claims * 1000)/1000
        this.dayprops.perc_reward_posts = Math.round(this.dayprops.reward_posts / this.dayprops.budget * 100 * 100)/100
        this.dayprops.perc_reward_comments = Math.round(this.dayprops.reward_comments / this.dayprops.budget * 100 * 100)/100

        this.chartPostSBD = this.generateChart(data.post,
          { gprops:gprops,
            dist:'sbd', 
            backgroundColor:'#3c8dbc',
            backgroundColorMedian:'#0546b5',
            title:'Paid SBD - Posts'
          })
        this.chartPostFreq = this.generateChart(data.post,
          { gprops:gprops,
            dist:'freq',
            backgroundColor:'#3c8dbc',
            backgroundColorMedian:'#0546b5',
            title: 'Number of posts'
          })
        this.chartCommentSBD = this.generateChart(data.comment,
          { gprops:gprops,
            dist:'sbd',
            backgroundColor:'#3c8dbc',
            backgroundColorMedian:'#0546b5',
            title: 'Paid SBD - Comments'
          })
        this.chartCommentFreq = this.generateChart(data.comment,
          { gprops:gprops,
            dist:'freq',
            backgroundColor:'#3c8dbc',
            backgroundColorMedian:'#0546b5',
            title: 'Number of comments'
          })
      }catch(error){
        console.log("Error getting document:", error)
      }
    },
    generateChart(data,opts) {
      var gprops = opts.gprops
      var s = 2e12
      var x = []
      var y = []
      var bgc = []
      var median_bar_done = false
      for(var i in data.x){
        var rs = data.x[i]
        var claims = rs * (rs + 2*s) / (rs + 4*s)
        var steem = gprops.reward_balance / gprops.recent_claims * claims
        var sbd = steem * gprops.feed_price
        x[i] = '$ ' + sbd.toFixed(3)
        switch(opts.dist){
          case 'sbd':
            y[i] = Math.round(data.y[i] * sbd * 100)/100
            break
          case 'freq':
            y[i] = data.y[i]
            break
          default:
            throw new Error('Error in generatechart')
        }

        if(!median_bar_done && rs > gprops.mrs){
          bgc[i] = opts.backgroundColorMedian
          median_bar_done = true
        }else{
          bgc[i] = opts.backgroundColor
        }
      }

      return {
        labels: x,
        datasets:[{
          label: opts.title,
          backgroundColor: bgc,
          data: y
        }]
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
