import Vue from "vue";
import Router from "vue-router";
import Home from "@/components/Home";
import OAMEntryPage from "@/components/OAMEntryPage";
import SearchPage from "@/components/SearchPage";
import Map from "@/components/Map";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Password from "@/components/Password";

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
    }
  ]
});
