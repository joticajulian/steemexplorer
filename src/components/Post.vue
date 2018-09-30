<template>
  <div class="post">
    <div v-if="this.exists">
      <div class="header">
        <div class="payout">{{payout.total}}</div>
        <div class="title">{{post.title}}</div>        
      </div>
      <div class="body break-word">{{post.body}}</div>
      <votes :data="this.post.active_votes" :payout="payout"></votes>
      
      <div class="raw">
        <card-data :data="this.post" title="Post"></card-data>      
      </div>
    </div>
  </div>  
</template>

<script>
import Config from '@/config.js'
import CardData from '@/components/CardData'
import Votes from '@/components/Votes'

export default {
  name: 'post',
  data () {
    return {
      post:{},
      payout:{total:''},
      exists: false,      
    }
  },
  
  components: {
    CardData,
    Votes,
  },
  
  created() {
    this.fetchData()
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    fetchData() {
      var author = this.$route.params.account;
      var permlink = this.$route.params.permlink;
      console.log('Fetching data for '+author+'/'+permlink);
      var self = this;
      steem.api.getContent(author,permlink, function (err, result) {      
        if (err || !result) {
          console.log(err, result);
          //Update UI
          return;
        }
        self.exists = true;
        result.json_metadata = JSON.parse(result.json_metadata);
        self.post = result;
        
        self.payout.old_post = (new Date()) - (new Date(result.cashout_time+'Z')) > 0;
        if(self.payout.old_post){
          self.payout.total = (parseFloat(result.total_payout_value) + parseFloat(result.curator_payout_value)).toFixed(3) +' '+ Config.SBD;
          self.payout.author = result.total_payout_value;
          self.payout.curator = result.curator_payout_value;
        }else{
          self.payout.total = result.pending_payout_value;
          self.payout.total_vote_weight = result.total_vote_weight;
        }        
      });      
    },
  }
}
</script>

<style scoped>
.header{
  width: 100%;
  display: block;
  margin-bottom: 15px;
}

.title{
  font-weight: bold;
  font-size: 1.3rem;
  display: block;
}

.payout{
  float: right;
  font-size: 1.3rem;
  font-weight: bold;
  margin-left: 25px;
}

.body{
  background-color: white;
  font-family: monospace;
  padding: 10px 15px;
  margin: 10px auto;
  border: solid 1px #8a8a8a;
}

</style>
