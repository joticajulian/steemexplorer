<template>
  <div>
    <b-modal ref="modalIssuer" hide-footer title="Add issuer">
      <div class="form-group row">
        <label for="input_issuer" class="col-md-4 col-form-label">ISSUER</label>
        <div class="col-md-8">
          <input class="form-control" type="text" id="input_issuer"
             v-model="issuer" placeholder="issuer"/>        
        </div>
      </div>
      <div class="form-group row">
        <label for="input_api" class="col-md-4 col-form-label">API</label>
        <div class="col-md-8">
          <input class="form-control" type="text" id="input_api"
             v-model="api" placeholder="api"/>
        </div>
      </div>
      <div class="form-group row">
        <label for="input_username" class="col-md-4 col-form-label">USERNAME</label>
        <div class="col-md-8">
          <input class="form-control" type="text" id="input_username"
             v-model="username" placeholder="username"/>        
        </div>
      </div>
      <div class="form-group row">
        <label for="input_password" class="col-md-4 col-form-label">PASSWORD</label>
        <div class="col-md-8">
          <input class="form-control" type="password" id="input_password"
             v-model="password" placeholder="password"/>        
        </div>
      </div>
      <div class="row">
        <div class="form-group col-md-12 align-bottom" style="padding-top: 8px;">
          <button @click="modifyIssuer" class="btn btn-primary mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Add</button>
          <button @click="closeModalIssuer"  class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </b-modal>

    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Issuers</h2>
      <div role="tablist">
        <b-card 
          v-for="(issuer,index) in issuers"
          v-bind:key="index"
          v-bind:value="index" class="mb-1"
        >
          <div role="tab" v-b-toggle="'accordion'+index">
            <div class="card-title">{{issuer.name}}</div>
          </div>
          <b-collapse :id="'accordion'+index" visible accordion="my-accordion" role="tabpanel">
            <div class="card-text">
              <div class="row">
                <div class="col-md-4">API:</div>
                <div class="col-md-8">{{issuer.api}}</div>
              </div> 
              <div class="row">
                <div class="col-md-4">USERNAME:</div>
                <div class="col-md-8">{{issuer.username}}</div>
              </div> 
              <div class="row">
                <div class="col-md-4">PASSWORD:</div>
                <div class="col-md-8">**********</div>
              </div> 
              <button class="btn btn-primary col-12" @click="openModalIssuer(issuer)">Modify</button>
            </div>
          </b-collapse>
        </b-card>
      </div>
      <button class="btn btn-primary" @click="openModalIssuer">Add</button>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>    
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import axios from 'axios'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import HeaderEFTG from '@/components/HeaderEFTG'
import Alerts from '@/mixins/Alerts'

export default {
  name: 'IssuerPage',

  data() {
    return {
      issuer: '',
      api: '',
      username: '',
      password: '',
      issuers: [],

      sending: false,
      EXPLORER: Config.EXPLORER
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    Alerts
  ],

  created() {
    this.loadIssuers()
  },

  methods: {
    async loadIssuers() {
      var response = await axios.get(Config.SERVER_API + 'issuers')
      console.log(Config.SERVER_API + 'issuers')
      console.log(response.data)
      this.issuers = response.data
    },

    async modifyIssuer() {
      try{
        var issuer = { 
          name: this.issuer,
          api: this.api,
          username: this.username,
          password: this.password
        } 
        var response = await axios.post(Config.SERVER_API + 'update_issuer', {issuer})
        this.showSuccess('Issuer added')
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    openModalIssuer(issuer = null) {
      this.$refs.modalIssuer.show()
      if(issuer){
        this.issuer = issuer.name,
        this.api = issuer.api,
        this.username = issuer.username,
        this.password = issuer.password,
        this.modalIssuerTitle = 'Modify issuer',
        this.modalIssuerButton = 'Modify'
      }else{
        this.issuer = '',
        this.api = '',
        this.username = '',
        this.password = '',
        this.modalIssuerTitle = 'Add issuer',
        this.modalIssuerButton = 'Add'
      }
    },

    closeModalIssuer() {
      this.$refs.modalIssuer.hide()
    },

    onLogin() {},
    onLogout() {}
  },
}

</script>

<style scoped>

.public-key {
  font-family: monospace;
  font-size: 1.3rem;
  overflow-wrap: break-word;
}

</style>
