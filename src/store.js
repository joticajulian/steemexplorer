import Vue from 'vue'
import Vuex from 'vuex'

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
    }
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {

  }
})
