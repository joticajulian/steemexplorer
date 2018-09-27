<template>
  <div class="account"
    ><div v-if="this.exists"
      ><div class="profile"
        ><div class="image" :style="'background-image: url(https://steemitimages.com/u/'+this.account.name+'/avatar/small);'"></div
        ><div class="name">@{{this.account.name}}</div
      ></div
      ><card-data :data="this.account" title="Account"></card-data
      ><div id="transactions" v-for="(tx,key,index) in transactions"
        ><transaction :tx="tx"></transaction
      ></div  
    ></div  
  ></div>
</template>

<script>
import CardData from '@/components/CardData'
import Transaction from '@/components/Transaction'

export default {
  name: 'Account',
  data () {
    return {
      account: {
      },
      transactions: {
      },
      from: -1,
      limit: 50,
      exists: false,
    }
  },
  
  components: {
    CardData,
    Transaction
  },
  
  created() {
    this.fetchData()
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    fetchData() {
      var name = this.$route.params.account;
      console.log('Fetching data for '+name);
      var self = this;
      steem.api.getAccounts([name], function (err, result) {      
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }
        self.exists = true;
        self.account = result[0];
      });
      steem.api.getAccountHistory(name,this.from,this.limit, function(err, result) {
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }        
        self.transactions = result;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.profile{
  text-align: center;
}

.image{
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  padding: 7px;
  height: 3.5rem;
  width: 3.5rem;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.name{
  font-size: 1.5rem;
  display: inline-block;
  font-weight: bold;  
}
</style>
