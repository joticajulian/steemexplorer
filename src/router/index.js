import Vue from "vue";
import Router from "vue-router";
import OAMEntryPage from "@/components/OAMEntryPage";
import SearchPage from "@/components/SearchPage";
import SignTrx from "@/components/SignTrx";

//steem.api.setOptions(Config.RPC_NODE);
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "OAMEntryPage",
      component: OAMEntryPage
    },
    {
      path: "/search.html",
      name: "SearchPage",
      component: SearchPage
    },
    {
      path: "/test",
      name: "SignTrx",
      component: SignTrx
    }
  ]
});
