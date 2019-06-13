<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Create proof</h2>
      <div :class="{'was-validated':was_validated}" novalidate>
        <div class="form-group row">
          <label for="input_issuer" class="col-md-2 col-form-label">ISSUER</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_issuer"
              v-model="issuer" placeholder="Issuer" :class="{'is-invalid': error.issuer }"/>
            <div v-if="error.issuer" class="invalid-feedback">{{ errorText.issuer }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_permlink" class="col-md-2 col-form-label">PERMLINK</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_permlink"
              v-model="permlink" placeholder="Permlink" :class="{'is-invalid': error.permlink }"/>
            <div v-if="error.permlink" class="invalid-feedback">{{ errorText.permlink }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_message" class="col-md-2 col-form-label">MESSAGE</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_message"
              v-model="message" placeholder="Challenge to sign" :class="{'is-invalid': error.message }"/>
            <div v-if="error.message" class="invalid-feedback">{{ errorText.message }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_expiration_date" class="col-md-2 col-form-label">EXPIRATION DATE</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_expiration_date"
              v-model="expiration_date" placeholder="yyyy-mm-dd" :class="{'is-invalid': error.expiration_date }"/>
            <div v-if="error.expiration_date" class="invalid-feedback">{{ errorText.expiration_date }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_private_key" class="col-md-2 col-form-label">PRIVATE KEY</label>
          <div class="col-md-10">
            <input class="form-control" type="password" id="input_private_key"
              v-model="private_key" placeholder="Private key" :class="{'is-invalid': error.private_key }"/>
            <div v-if="error.private_key" class="invalid-feedback">{{ errorText.private_key }}</div>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button @click="create_proof" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Create proof</button>
          </div>
        </div>
        <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
        <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
        <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import axios from 'axios'
import { Client, PrivateKey } from 'eftg-dsteem'
import { saveAs } from 'file-saver'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'IssueCredential',

  data() {
    return {
      issuer: '',
      permlink: '',
      message: '',
      expiration_date: '',
      private_key: '',
      
      sending: false,
      error: {
        issuer: false,
        permlink: false,
        message: false,
        expiration_date: false,
        private_key: false,
      },
      errorText: {
        issuer: '',
        permlink: '',
        message: '',
        expiration_date: '',
        private_key: '',
      },
      was_validated: false,
      EXPLORER: Config.EXPLORER,
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    SteemClient
  ],

  created() {
    this.expiration_date = new Date().toISOString().slice(0, -5)

    //validate fields while typing
    this.debounced_validateIssuer         = debounce(this.validateIssuer         , 300)
    this.debounced_validatePermlink       = debounce(this.validatePermlink       , 300)
    this.debounced_validateMessage        = debounce(this.validateMessage        , 300)
    this.debounced_validateExpirationDate = debounce(this.validateExpirationDate , 300)
    this.debounced_validatePrivateKey     = debounce(this.validatePrivateKey     , 300)
  },

  watch: {
    issuer: function() { this.debounced_validateIssuer() },
    permlink: function() { this.debounced_validatePermlink() },
    message: function() { this.debounced_validateMessage() },
    expiration_date: function() { this.debounced_validateExpirationDate() },
    private_key: function() { this.debounced_validatePrivateKey() }
  },

  methods: {
    async create_proof() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        var valid = true;
        valid = this.validateIssuer(true) && valid
        valid = this.validatePermlink(true) && valid
        valid = this.validateMessage(true) && valid
        valid = this.validateExpirationDate(true) && valid
        valid = this.validatePrivateKey(true) && valid
        var privKey = PrivateKey.fromString(this.private_key)
        var pubKey = privKey.createPublic(Config.STEEM_ADDRESS_PREFIX).toString()
        
        this.was_validated = true
        if (!valid) {
          throw new Error("Error validating fields!");
        }
        var include_badge = false
        if( this.issuer !== '' || this.permlink !== '' ){
          include_badge = true
          var content = await this.steem_database_call( 'get_content', [this.issuer, this.permlink] )
          if(!content) throw new Error('There is no content on @'+this.issuer+'/'+this.permlink)
          var metadata = JSON.parse(content.json_metadata)
          if(!metadata || !metadata.assertions) throw new Error('@'+this.issuer+'/'+this.permlink+' does not corresponds with a badge with assertions')
          var assertion = metadata.assertions.find( (a)=>{ return a.recipient.identity === pubKey })
          if(!assertion) throw new Error('There are not assertions in the badge that match with this private key')
        }
        
        var client = this.RPCnode_initClient()

        var trx = {
          ref_block_num: 0,
          ref_block_prefix: 0,
          expiration: this.expiration_date,
          operations: [
            ['transfer',
              {
                from: '',
                to: '',
                amount: '0.001 ' + Config.STEEM_ADDRESS_PREFIX,
                memo: this.message
              }
            ]
          ],
          extensions: []
        }
        var sgnTrx = client.broadcast.sign(trx, privKey)
        console.log(sgnTrx)
        var presentation = {}
        if(include_badge) {
          presentation.badge = {
            issuer: this.issuer,
            permlink: this.permlink
          }
        }
        presentation.proof = sgnTrx

        var blob = new Blob([JSON.stringify(presentation)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "proof.json");

        this.showSuccess('Proof created')
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }

      this.sending = false
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

    validateIssuer(submit) {
      let self = this
      return this.validateField('issuer', submit, function(){
        
      })
    },

    validatePermlink(submit) {
      let self = this
      return this.validateField('permlink', submit, function(){
        
      })
    },

    validateMessage(submit) {
      let self = this
      return this.validateField('message', submit, function(){
        
      })
    },

    validateExpirationDate(submit) {
      let self = this
      return this.validateField('expiration_date', submit, function(){
        var d = new Date(self.expiration_date + 'Z').toISOString().slice(0, -5)
        if(d !== self.expiration_date) throw new Error('Incorrect date')
      })
    },

    validatePrivateKey(submit) {
      let self = this
      return this.validateField('private_key', submit, function(){
        
      })
    },
  },
}

</script>
