import Config from '@/config.js'

export default {
  
  data: function(){
    return {
      chain : {
        feed_price: -1,
        steem_per_mvests: 0,
        reward_balance: 0,
        recent_claims: 1,
        sbd_per_rshare: 0,
        steem_per_rshare: 0,
      },
      
      STEEM_SYMBOL: Config.STEEM,
      SBD_SYMBOL: Config.SBD,
      VESTS_SYMBOL: Config.VESTS,
      SP_SYMBOL: Config.SP,
      
      STEEM_SBD_START_PERCENT: Config.STEEM_SBD_START_PERCENT,
      STEEM_SBD_STOP_PERCENT: Config.STEEM_SBD_STOP_PERCENT,
    }
  },
  
  created() {    
    this.getChainProperties()
  },
  
  methods: {
    changeFeedPrice(price){      
    },
    
    updateRS() {
      this.chain.steem_per_rshare = this.chain.reward_balance / this.chain.recent_claims;
      this.chain.sbd_per_rshare = this.chain.steem_per_rshare * this.chain.feed_price;
    },
    
    getChainProperties() {
      var self = this;
      steem.api.getRewardFund('post', function (err, result) {      
        if (err || !result) {
          console.log(err, result);
          return;
        }
        self.chain.reward_balance = parseFloat(result.reward_balance);
        self.chain.recent_claims = parseInt(result.recent_claims);
        self.updateRS();
      });
      
      steem.api.getDynamicGlobalProperties(function(err, result){
        if (err || !result) {
          console.log(err, result);
          return;
        }
        self.chain.steem_per_mvests = parseFloat(result.total_vesting_fund_steem)*1000000/parseFloat(result.total_vesting_shares);
      });
      
      steem.api.getCurrentMedianHistoryPrice(function(err, result){
        if (err || !result) {
          console.log(err, result);
          return;
        }
        self.chain.feed_price = parseFloat(result.base)/parseFloat(result.quote);
        self.updateRS();
        self.changeFeedPrice(self.chain.feed_price)
      });
    },
    
    vests2sp(vests){
      return (this.chain.steem_per_mvests * parseFloat(vests) / 1000000).toFixed(3) + ' ' + Config.SP;
    }
  }
}
