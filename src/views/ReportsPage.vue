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
            <button class="btn btn-primary" @click="load_more_days">More</button>
          </div>
        </div>
        <div class="col-md-10">
          <BarChart :chartData="bardata"></BarChart>
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
      bardata: { labels: [], datasets: [] }
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
    if(firebase.apps.length == 0){
      firebase.initializeApp({
        apiKey: 'AIzaSyDK86eQUpJK4d717rQxw8NUzu_u3w2c9Vw',
        authDomain: 'steem-states-bot.firebaseapp.com',
        projectId: 'steem-states-bot'
      })
    }
    this.db = firebase.firestore();
    this.selectDay( this.days[0] )
  },

  watch: {
  },

  methods: {
    selectDay(day){
      let self = this
      this.db.collection('daily_reports').doc(day).get()
        .then(function(doc){
          if (doc.exists) {
            var repdata = doc.data()
            self.bardata = {
              labels: repdata.post.x,
              datasets:[{
                label: 'Posts',
                backgroundColor: '#3c8dbc',
                data:repdata.post.y
              }]
            }
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
