<template>
  <div class="account">
    <card-data :data="this.account" title="Account"></card-data>
  </div>
</template>

<script>
import CardData from '@/components/CardData'

export default {
  name: 'Account',
  data () {
    return {
      account: {
        json_metadata: 'metadata vacía'
      }
    }
  },
  
  components: {
    CardData
  },
  
  created() {
    this.fetchData()
  },

  watch: {
    '$route': 'fetchData'
  },

  methods: {
    fetchData() {
      var name = this.$route.params.id;
      console.log('Fetching data for '+name);
      name = name.replace('@','');
      self = this;
      self.account.json_metadata = 'llamando steem api';
      steem.api.getAccounts([name], function (err, result) {      
        if (err || !result || result.length == 0) {
          console.log(err, result);
          //Update UI
          return;
        }
        self.account = result[0];
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
