import { Client } from 'eftg-dsteem'
import Config from '@/config.js'
import SteemClient from '@/mixins/SteemClient.js'

export default {
  
  data: function(){
    return {
      chain: {
        feed_price: -1,
        steem_per_mvests: 0,
        reward_balance: 0,
        recent_claims: 1,
        sbd_per_rshare: 0,
        steem_per_rshare: 0,
        haircut_price: -1,
      },

      STEEM_SYMBOL: Config.STEEM,
      SBD_SYMBOL: Config.SBD,
      VESTS_SYMBOL: Config.VESTS,
      SP_SYMBOL: Config.SP,
      
      STEEM_SBD_START_PERCENT: Config.STEEM_SBD_START_PERCENT,
      STEEM_SBD_STOP_PERCENT: Config.STEEM_SBD_STOP_PERCENT,
    }
  },

  mixins: [
    SteemClient
  ],

  created() {
    this.getChainProperties()
  },

  methods: {
    changeFeedPrice(price){      
    },
    
    updateRS() {
      this.chain.steem_per_rshare = this.chain.reward_balance / this.chain.recent_claims;
      this.chain.sbd_per_rshare = this.chain.steem_per_rshare * this.chain.feed_price;

      this.$store.state.chain.steem_per_rshare = this.chain.steem_per_rshare
      this.$store.state.chain.sbd_per_rshare   = this.chain.sbd_per_rshare
    },
    
    async getChainProperties(force = false) {

      if(!force && this.$store.state.chain.steem_per_mvests) {
        this.chain = this.$store.state.chain
        return
      }

      var result = await this.steem_database_call('get_reward_fund',['post'])
      this.chain.reward_balance = parseFloat(result.reward_balance)
      this.chain.recent_claims = parseInt(result.recent_claims)

      this.$store.state.chain.reward_balance = this.chain.reward_balance
      this.$store.state.chain.recent_claims  = this.chain.recent_claims
      this.updateRS();

      var result = await this.steem_database_call('get_dynamic_global_properties');
      for(var i in result) this.chain[i] = result[i]
      this.chain.steem_per_mvests = parseFloat(result.total_vesting_fund_steem)*1000000/parseFloat(result.total_vesting_shares)
      this.chain.haircut_price = 9*parseFloat(result.current_sbd_supply) / parseFloat(result.current_supply)

      this.$store.state.chain.steem_per_mvests = this.chain.steem_per_mvests
      this.$store.state.chain.haircut_price = this.chain.haircut_price

      var result = await this.steem_database_call('get_current_median_history_price')
      this.chain.feed_price = parseFloat(result.base)/parseFloat(result.quote)
      this.$store.state.chain.feed_price = this.chain.feed_price

      this.updateRS();
      this.changeFeedPrice(this.chain.feed_price)
    },

    vests2sp(vests){
      return (this.chain.steem_per_mvests * parseFloat(vests) / 1000000).toFixed(3) + ' ' + Config.SP;
    },

    witnessVotes2sp(votes){
      votes = parseInt(votes)
      var sp = parseInt(votes)/1e12 * this.chain.steem_per_mvests
      if(sp < 1e3) return `${sp.toFixed(2)} ${Config.SP}`
      if(sp < 1e6) return `${(sp/1e3).toFixed(2)}k ${Config.SP}`
      if(sp < 1e9) return `${(sp/1e6).toFixed(2)} million ${Config.SP}`
      if(sp < 1e12) return `${(sp/1e9).toFixed(2)} billion ${Config.SP}`
    },
  }
}
