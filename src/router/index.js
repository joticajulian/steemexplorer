import Vue from "vue";
import Router from "vue-router";
import Home from "@/components/Home";
import OAMEntryPage from "@/components/OAMEntryPage";
import SearchPage from "@/components/SearchPage";
import Map from "@/components/Map";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Password from "@/components/Password";

// Explorer
import HomeExplorer from '@/components/explorer/Home'
import AccountExplorer from '@/components/explorer/Account'
import PostExplorer from '@/components/explorer/Post'
import BlockExplorer from '@/components/explorer/Block'
import TransactionExplorer from '@/components/explorer/Transaction'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/oam-portal",
      name: "OAMEntryPage",
      component: OAMEntryPage
    },
    {
      path: "/search.html",
      name: "SearchPage",
      component: SearchPage
    },
    {
      path: "/faq",
      name: "Faq",
      component: Faq
    },
    {
      path: "/map",
      name: "Map",
      component: Map
    },
    {
      path: "/contact",
      name: "Contact",
      component: Contact
    },
    {
      path: "/password",
      name: "Password",
      component: Password
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
    }
  ]
});
