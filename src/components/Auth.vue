<template>
  <div class="container">
    <div novalidate>
      <div class="form-group row">
        <label for="inputUsername" class="col-md-4 col-form-label">USERNAME</label>
        <div class="col-md-8">
          <input class="form-control" type="text" id="inputUsername"
             @keyup.enter="try_to_login" 
             v-model="username" placeholder="Enter your username"/>        
        </div>
      </div>
      <div class="form-group row">
        <label for="inputPassword" class="col-md-4 col-form-label">PASSWORD</label>
        <div class="col-md-8">
          <input class="form-control" type="password" id="inputPassword"
             @keyup.enter="try_to_login"
             v-model="password" placeholder="Password or WIF"/>        
        </div>
      </div>
      <div class="row">
        <div class="form-group col-md-12 align-bottom" style="padding-top: 8px;">
          <button @click="try_to_login" class="btn btn-primary mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Login</button>
          <button @click="close"  class="btn btn-secondary">Cancel</button>
        </div>
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>
  </div>  
</template>

<script>
import { Client, PrivateKey } from 'eftg-dsteem'
import axios from 'axios'
import Config from "@/config.js";
import Utils from "@/js/utils.js";
import Alerts from '@/mixins/Alerts.js'
import router from '@/router.js'

export default {
  name: "Auth",

  data() {
    return {
      username: "",
      password: "",
      auth: {
        user: "",
        logged: false,
        imgUrl: "",
        keys: {
          owner: null,
          active: null,
          posting: null,
          memo: null
        }
      },
      sending: false,
    };
  },

  mixins: [
    Alerts
  ],

  methods: {
    try_to_login() {
      let self = this;
      async function main() {
        self.sending = true
        self.hideDanger()
        self.hideInfo()
        var auth = await self.login(self.username, self.password);
        if (auth.logged) {
          self.$store.state.auth = auth
          self.$emit("login")
        }
        self.sending = false
      }
      main().catch(function(error) {
        console.log(error);
        self.showDanger(error.message)
        self.sending = false
        self.$emit('error')
      });
    },

    /**
     * Checks if the password or WIF is valid for that user
     */
    async login(_username, _password) {
    
      let data = {
        email: _username,
        password: _password
      }
      var auth = {}

      var response = await axios.post(Config.SERVER_API + "login", data)
      console.log("Logged in")
      console.log(response)
      //var response = await axios.get(Config.SERVER_API + "user")
      var response = await axios.get(Config.SERVER_API + "getuser/" + response.data._id) //todo: remove
      response.data.user.logged = true
      console.log('User details')
      console.log(response.data.user)
      router.push("/adminstudents") //todo: handle type
      return response.data.user
    },

    close() {
      this.$emit("close");
    },
  }
};
</script>

<style scoped>

</style>
