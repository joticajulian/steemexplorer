<template>
  <div class="post">
    <div v-if="this.exists">
      <div class="raw">
        <card-data :data="this.post" title="Post"></card-data>      
      </div>
    </div>
  </div>  
</template>

<script>
import CardData from '@/components/CardData'

export default {
  name: 'post',
  data () {
    return {
      post:{},
      exists: false,
    }
  },
  
  components: {
    CardData,
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
      });      
    }
  }
}
</script>

<style scoped>

</style>
