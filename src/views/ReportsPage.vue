<template>
  <div>
    <b-modal ref="modalTop50" hide-footer title="Top50">
      <div class="text-right">
        <select v-model="sel_top50">
          <option value="post">Top50 posts</option>
          <option value="comment">Top50 comments</option>
          <option value="post_down">Top50 downvoted posts</option>
          <option value="comment_down">Top50 downvoted comments</option>
        </select>
      </div>
      <div class="row mt-3" v-for="(item, index) in top50" :key="index">
        <div class="col-md-1 align-middle">#{{index}}</div>
        <div class="col-md-8">
          <div>
            <router-link :to="item.url" class="text-break">{{item.title}}</router-link>
          </div>
          <small class="text-secondary">@{{item.author}} - #{{item.category}}</small>
        </div>
        <div class="col-md-3">
          <div class="text-right text-success"><small>+ ${{item.upvotes}}</small></div>
          <div class="text-right text-danger"><small>- ${{item.downvotes}}</small></div>
          <div class="text-right">{{item.finalPayout}}</div>
        </div>
      </div>
    </b-modal>

    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Reports</h2>
      <div class="row">
        <div class="col-md-2">
          <ul class="list-group list-group-flush">
            <li v-for="(day, index) in days" :key="index" class="list-group-item text-center" @click="selectDay(day)">
              <span>{{day}}</span>
            </li>
          </ul>
          <div v-if="there_are_more_days" class="mt-2 text-center">
            <button class="btn btn-primary" @click="loadMoreDays">More</button>
          </div>
        </div>
        <div class="col-md-10">
          <h2 class="text-center bg-primary text-light pt-2 pb-2">{{curDay.day}}</h2>
          <div class="bg-secondary p-3">
            <h3>Budget: {{dayprops.budget}} STEEM</h3>
            <h4>Paid posts: {{dayprops.reward_posts}} STEEM ({{dayprops.perc_reward_posts}}%)</h4>
            <h4 v-if="show_paid_comments">Paid comments: {{dayprops.reward_comments}} STEEM ({{dayprops.perc_reward_comments}}%)</h4>
            <div class="row">
              <div class="col-md-2 col-xs-6">Median payout</div>
              <div class="col">{{dayprops.median_payout}} STEEM <small>({{dayprops.median_payout_sbd}} SBD)</small></div>
            </div>
            <div class="row">
              <div class="col-md-2 col-xs-6">Downvote use</div>
              <div class="col">{{dayprops.downvote_use}}%</div>
            </div>
            <div class="row">
              <div class="col-md-2 col-xs-6">Total posts</div>
              <div class="col">{{curDay.data.post.total_comments}}</div>
            </div>
            <div class="row">
              <div class="col-md-2 col-xs-6">Total comments</div>
              <div class="col">{{curDay.data.comment.total_comments}}</div>
            </div>
          </div>
          <div class="text-right mt-3">
            <button class="btn btn-primary" @click="showTop50">Top50</button>
          </div>
          <div class="text-right mt-3">
            <select v-model="sel_distribution">
              <option value="frequency">Frequency distribution</option>
              <option value="cumulative">Cumulative distribution</option>
            </select>
          </div>
          <div class="row">
            <div class="col-md-6">
              <BarChart :chartData="chartPostSBD.chartData" :options="chartPostSBD.options"></BarChart>
              <BarChart :chartData="chartPostFreq.chartData" :options="chartPostFreq.options" class="mt-5"></BarChart>
            </div>
            <div class="col-md-6">
              <BarChart :chartData="chartCommentSBD.chartData" :options="chartCommentSBD.options"></BarChart>
              <BarChart :chartData="chartCommentFreq.chartData" :options="chartCommentFreq.options" class="mt-5"></BarChart>
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
      sel_distribution: 'frequency',
      sel_top50: 'post',
      top50: [],
      chartPostSBD: { labels: [], datasets: [] },
      chartPostFreq: { labels: [], datasets: [] },
      chartCommentSBD: { labels: [], datasets: [] },
      chartCommentFreq: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false
      },
      curDay: {
        data: {
          post: {total_comments: 0},
          comment: {total_comments: 0},
        },
        gprops: null,
        day: null
      },
      dayprops: {
        budget: 0,
        reward_posts: 0,
        reward_comments: 0,
        perc_reward_posts: 0,
        perc_reward_comments: 0,
        median_payout: 0,
        median_payout_sbd: 0,
        downvote_use: 0,
      },
      show_paid_comments: true
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
  },

  watch: {
    sel_distribution: function(){
      this.drawCharts()
    },
    sel_top50: function(){
      this.selTop50()
    }
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
        this.dayprops.median_payout = (mcl * gprops.reward_balance / gprops.recent_claims).toFixed(3)
        this.dayprops.median_payout_sbd = (mcl * gprops.reward_balance / gprops.recent_claims * gprops.feed_price).toFixed(3)
        gprops.mrs = mrs

        var total_up = data.post.total_up_rshares + data.comment.total_up_rshares
        var total_down = data.post.total_down_rshares + data.comment.total_down_rshares

        this.dayprops.budget = Math.round(gprops.reward_balance / 15 * 1000)/1000
        this.dayprops.reward_posts = Math.round(data.post.total_claims * gprops.reward_balance / gprops.recent_claims * 1000)/1000
        this.dayprops.reward_comments = Math.round(data.comment.total_claims * gprops.reward_balance / gprops.recent_claims * 1000)/1000
        this.dayprops.perc_reward_posts = Math.round(this.dayprops.reward_posts / this.dayprops.budget * 100 * 100)/100
        this.dayprops.perc_reward_comments = Math.round(this.dayprops.reward_comments / this.dayprops.budget * 100 * 100)/100
        this.dayprops.downvote_use = Math.round( -total_down / total_up * 100 * 100)/100

        this.curDay = {
          data,
          gprops,
          day
        }
        this.drawCharts()

        if(new Date(day) >= new Date('2019-12-27'))
          this.show_paid_comments = true
        else
          this.show_paid_comments = false
      }catch(error){
        console.log("Error getting document:", error)
      }
    },

    drawCharts(){
      var data = this.curDay.data
      var gprops = this.curDay.gprops
      var cumulative = this.sel_distribution === 'cumulative' ? true : false
      this.chartPostSBD = this.generateChart(data.post,
        { gprops:gprops,
          dist:'sbd',
          cumulative,
          backgroundColor:'#3c8dbc',
          backgroundColorMedian:'#0546b5',
          title: cumulative ? 'Cumulative distribution of post rewards' : 'Distribution of post rewards',
          ytitle: cumulative ? 'Percentage' : 'Total rewards [SBD]',
          xtitle: 'Post value [SBD]'
        })
      this.chartPostFreq = this.generateChart(data.post,
        { gprops:gprops,
          dist:'freq',
          cumulative,
          backgroundColor:'#3c8dbc',
          backgroundColorMedian:'#0546b5',
          title: cumulative ? 'Cumulative distribution of number of posts' : 'Number of posts',
          ytitle: cumulative ? 'Percentage' : 'Number of posts',
          xtitle: 'Post value [SBD]'
        })
      this.chartCommentSBD = this.generateChart(data.comment,
        { gprops:gprops,
          dist:'sbd',
          cumulative,
          backgroundColor:'#3c8dbc',
          backgroundColorMedian:'#0546b5',
          title: cumulative ? 'Cumulative distribution of comment rewards' : 'Distribution of comment rewards',
          ytitle: cumulative ? 'Percentage' : 'Total rewards [SBD]',
          xtitle: 'Post value [SBD]'
        })
      this.chartCommentFreq = this.generateChart(data.comment,
        { gprops:gprops,
          dist:'freq',
          cumulative,
          backgroundColor:'#3c8dbc',
          backgroundColorMedian:'#0546b5',
          title: cumulative ? 'Cumulative distribution of number of comments' : 'Number of comments',
          ytitle: cumulative ? 'Percentage' : 'Number of comments',
          xtitle: 'Post value [SBD]'
        })
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
        x[i] = '$' + sbd.toFixed(3)
        switch(opts.dist){
          case 'sbd':
            y[i] = Math.round(data.y[i] * steem * 100)/100
            break
          case 'freq':
            y[i] = data.y[i]
            break
          default:
            throw new Error('Error in generatechart')
        }

        if(opts.cumulative){
          var delta = y[i]
          if(i==0)
            y[i] = delta
          else
            y[i] = y[i-1] + delta
        }

        if(!median_bar_done && rs > gprops.mrs){
          bgc[i] = opts.backgroundColorMedian
          median_bar_done = true
        }else{
          bgc[i] = opts.backgroundColor
        }
      }

      if(opts.cumulative){
        var total_y = y[y.length-1]
        for(i in y){
          y[i] = y[i] / total_y * 100
        }
      }

      return {
        chartData:{
          labels: x,
          datasets:[{
            label: opts.title,
            backgroundColor: bgc,
            data: y
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: opts.ytitle
              },
              ticks: {
                callback: function(value){
                  if(opts.cumulative)
                    return value + '%'
                  else if(opts.dist === 'sbd')
                    return '$' + value
                  else
                    return value
                }
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: opts.xtitle
              }
            }]
          }
        }
      }
    },

    showTop50() {
      this.$refs.modalTop50.show()
      this.selTop50()
    },

    selTop50() {
      this.top50 = []
      var gprops = this.curDay.gprops
      switch(this.sel_top50){
        case 'post':
          this.top50 = this.curDay.data.post.top_rshares
          break
        case 'comment':
          this.top50 = this.curDay.data.comment.top_rshares
          break
        case 'post_down':
          this.top50 = this.curDay.data.post.top_down_rshares
          break
        case 'comment_down':
          this.top50 = this.curDay.data.comment.top_down_rshares
          break
        default:
          throw new Error('Bad value in switch select top50')
      }
      var s = 2e12
      for(var i in this.top50){
        var item = this.top50[i]
        item.url = Config.EXPLORER + '@' + item.author + '/' + item.permlink
        item.title = item.permlink.replace(/-/gm,' ')

        var rs = item.up_rshares
        var claims = rs * (rs + 2*s) / (rs + 4*s)
        var steem = gprops.reward_balance / gprops.recent_claims * claims
        var sbd = steem * gprops.feed_price
        item.upvotes = sbd.toFixed(3)

        rs = rs + item.down_rshares
        claims = rs * (Math.abs(rs) + 2*s) / (Math.abs(rs) + 4*s)
        steem = gprops.reward_balance / gprops.recent_claims * claims
        sbd = steem * gprops.feed_price
        item.downvotes = (sbd - parseFloat(item.upvotes)).toFixed(3)

        rs = item.net_rshares
        claims = rs * (rs + 2*s) / (rs + 4*s)
        steem = gprops.reward_balance / gprops.recent_claims * claims
        sbd = steem * gprops.feed_price
        item.finalPayout = sbd.toFixed(3)
        this.$set(this.top50, i, item)
      }
    },

    loadMoreDays(){
      for(var i=0;i<5;i++){
        var last_day = this.days[ this.days.length - 1]
        if(last_day === '2019-11-16'){
          this.there_are_more_days = false
          break
        }
        var previous_day = new Date(new Date(last_day) - 1000*60*60*24).toISOString().slice(0,-14)
        this.days.push(previous_day)
      }
    },
    onLogin(){},
    onLogout(){}
  }
}
</script>

<style scoped>
</style>
