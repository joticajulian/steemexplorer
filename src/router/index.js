import Vue from 'vue'
import Router from 'vue-router'
import Config from '@/config.js'
import Home from '@/components/Home'
import Account from '@/components/Account'
import Post from '@/components/Post'
import Block from '@/components/Block'
import Transaction from '@/components/Transaction'

Vue.use(Router)
steem.api.setOptions(Config.RPC_NODE);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/@:account',
      name: 'Account',
      component: Account
    },{
      path: '/@:account/:permlink',
      name: 'Post',
      component: Post
    },{
      path: '/b/:id',
      name: 'Block',
      component: Block
    },{
      path: '/b/:id/:tx',
      name: 'Transaction',
      component: Transaction
    },    
  ],
  //mode: 'history',
})
