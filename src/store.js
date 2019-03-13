import Vue from 'vue'
import Vuex from 'vuex'
import Config from '@/config.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {
      user: '',
      logged: false,
      imgUrl: '',
      keys: {
        owner: null,
        active: null,
        posting: null,
        memo: null
      }
    },
    rpc_node: {
      current: Config.RPC_NODES[0],
      current_id: 0,
      fails: 0,
      fail_rounds: 0,
      max_fails: 1,
      max_fail_rounds: 1000000
    },
  },
  mutations: {

  },
  actions: {

  }
})
