<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Key Management</h2>
      <div id="eftg-form" novalidate>
        <div class="form-group row">
          <label for="input_user" class="col-md-2 col-form-label">USER</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_user"
              v-model="user" placeholder="User" :class="{'is-invalid': error.user }"/>
            <div v-if="error.user" class="invalid-feedback">{{ errorText.user }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_password" class="col-md-2 col-form-label">PASSWORD</label>
          <div class="col-md-10">
            <input class="form-control" type="password" id="input_password"
              v-model="password" placeholder="Password" :class="{'is-invalid': error.password }"/>
            <div v-if="error.password" class="invalid-feedback">{{ errorText.password }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_issuer" class="col-md-2 col-form-label">ISSUER</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_issuer"
              v-model="issuer" :class="{'is-invalid': error.issuer }"/>
            <div v-if="error.issuer" class="invalid-feedback">{{ errorText.issuer }}</div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button @click="consult" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Consult</button>
            <div v-if="sending" class="btn">
              <button v-on:click="abort" class="btn btn-secondary mr-2" :disabled="aborting"><div v-if="aborting" class="mini loader"></div>Abort</button>
            </div>
          </div>
        </div>
        <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
        <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
        <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
      </div>
      <div v-if="derived_keys.length>0" class="mt-4">
        <h3>Derived keys with issuer @{{last_issuer}}</h3>
        <table class="table">
          <thead>
            <tr class="table-primary">
              <th scope="col">#</th>
              <th scope="col">Public key</th>
              <th scope="col">Private key</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(key,index) in derived_keys"
              v-bind:key="key.public"
              v-bind:value="key.public"
            >
              <td>{{ index }}</td>
              <td>{{ key.public }}</td>
              <td>{{ key.private }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { PrivateKey } from 'eftg-dsteem'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'KeyManagement',

  data() {
    return {

      user: '',
      password: '',
      issuer: '',
      derived_keys: [],
      last_issuer: '',

      sending: false,
      error: {
        user: false,
        password: false,
        issuer: false
      },
      errorText: {
        user: '',
        password: '',
        issuer: ''
      }
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    SteemClient
  ],

  created() {
    this.clear()
  },

  methods: {
    consult() {
      //todo: validate
      this.derived_keys = []
      for(var i=0; i<10; i++){
        var role = this.issuer + i
        var privKey = PrivateKey.fromLogin(this.user, this.password, role)
        this.derived_keys.push({
          public:  privKey.createPublic(Config.STEEM_ADDRESS_PREFIX).toString(),
          private: privKey.toString()
        })
      }
      this.last_issuer = this.issuer
    },
    clear() {
      this.user = ''
      this.password = ''
      this.issuer = ''

      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },
    onLogin() {},
    onLogout() {},

    showInvalid(field, message) {
      this.error[field] = true
      this.errorText[field] = message
      document.getElementById('input_'+field).setCustomValidity('invalid')
    },

    hideInvalid(field) {
      this.error[field] = false
      this.errorText[field] = 'No error'
      document.getElementById('input_'+field).setCustomValidity('')
    },

    validateField(field, submit, callback) {
      if(!submit && this[field] === '') {
        this.hideInvalid(field)
        return true
      }
      try{
        callback()
        this.hideInvalid(field)
      }catch(error){
        this.showInvalid(field, error.message)
        return false
      }
      return true
    },

    // validation
    validateUser(submit) {
      let self = this
      return this.validateField('user', submit, function(){
        // validation
      } )
    },

    validatePassword(submit) {
      let self = this
      return this.validateField('password', submit, function(){
        // validation
      } )
    },

    validateIssuer(submit) {
      let self = this
      return this.validateField('issuer', submit, function(){
        // validation
      } )
    },
  },
}

</script>
