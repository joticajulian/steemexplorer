import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import MapPage from '@/components/MapPage'
import Password from '@/components/Password'
import Witnesses from '@/components/Witnesses'
import Page404 from '@/components/Page404'

// Explorer
import HomeExplorer from '@/components/explorer/Home'
import AccountExplorer from '@/components/explorer/Account'
import PostExplorer from '@/components/explorer/Post'
import BlockExplorer from '@/components/explorer/Block'
import TransactionExplorer from '@/components/explorer/Transaction'

Vue.use(Router)

export default new Router({
  //mode: 'history',
  base: process.env.BASE_URL,
  /*routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/About.vue')
    }
  ]*/
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeExplorer
    },
    {
      path: "/map",
      name: "MapPage",
      component: MapPage
    },
    {
      path: "/password",
      name: "Password",
      component: Password
    },
    {
      path: "/witnesses",
      name: "Witnesses",
      component: Witnesses
    },
    {
      path: "/rewardcalc",
      name: "RewardCalc",
      component: () => import('./views/RewardCalcPage.vue')
    },
    {
      path: "/broadcast",
      name: "Broadcast",
      component: () => import('./views/BroadcastPage.vue')
    },
    {
      path: "/proposals",
      name: "Proposals",
      component: () => import('./views/ProposalsPage.vue')
    },
    {
      path: "/proposals/:id",
      name: "Proposal",
      component: () => import('./views/ProposalPage.vue')
    },
    {
      path: "/reports",
      name: "Reports",
      component: () => import('./views/ReportsPage.vue')
    },
    {
      path: "/explorer",
      name: "Explorer",
      component: HomeExplorer
    },
    {
      path: '/explorer/@:account',
      name: 'Account',
      component: AccountExplorer
    },{
      path: '/explorer/@:account/:permlink',
      name: 'Post',
      component: PostExplorer
    },{
      path: '/explorer/b/:id',
      name: 'Block',
      component: BlockExplorer
    },{
      path: '/explorer/b/:id/:tx',
      name: 'Transaction',
      component: TransactionExplorer
    },{
      path: '*',
      name: 'Page404',
      component: Page404
    }
  ]
})
