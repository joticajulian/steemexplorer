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
import Auth from '@/mixins/Auth.js'
import router from '@/router.js'

export default {
  name: "Auth",

  data() {
    return {
      username: "",
      password: "",
      sending: false,
    };
  },

  mixins: [
    Auth,
    Alerts
  ],

  methods: {
    async try_to_login() {
      let self = this;
      try{
        self.sending = true
        self.hideDanger()
        self.hideInfo()
        var auth = await self.login(self.username, self.password);
        if (auth.logged) {
          self.$emit("login")
        }
      }catch(error) {
        console.log(error);
        self.showDanger(error.message)
        self.sending = false
        self.$emit('error')
      }
      self.sending = false
    },

    close() {
      this.$emit("close");
    },
  }
};
</script>

<style scoped>

</style>
