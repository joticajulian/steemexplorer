<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Create proof</h2>
      <div :class="{'was-validated':was_validated}" novalidate>
        <div class="form-group row">
          <label for="input_block" class="col-md-2 col-form-label">BLOCK</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_block"
              v-model="block" placeholder="Block number" :class="{'is-invalid': error.block }"/>
            <div v-if="error.block" class="invalid-feedback">{{ errorText.block }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_tx" class="col-md-2 col-form-label">TX ID</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_tx"
              v-model="tx" placeholder="Transaction ID" :class="{'is-invalid': error.tx }"/>
            <div v-if="error.tx" class="invalid-feedback">{{ errorText.tx }}</div>
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
            <input class="form-control" type="text" id="input_private_key"
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

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'IssueCredential',

  data() {
    return {
      block: '',
      tx: '',
      message: '',
      expiration_date: '',
      private_key: '',
      
      sending: false,
      error: {
        block: false,
        tx: false,
        message: false,
        expiration_date: false,
        private_key: false,
      },
      errorText: {
        block: '',
        tx: '',
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
    this.debounced_validateBlock          = debounce(this.validateBlock          , 300)
    this.debounced_validateTx             = debounce(this.validateTx             , 300)
    this.debounced_validateMessage        = debounce(this.validateMessage        , 300)
    this.debounced_validateExpirationDate = debounce(this.validateExpirationDate , 300)
    this.debounced_validatePrivateKey     = debounce(this.validatePrivateKey     , 300)
  },

  watch: {
    block: function() { this.debounced_validateBlock() },
    tx: function() { this.debounced_validateTx() },
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
        valid = this.validateBlock(true) && valid
        valid = this.validateTx(true) && valid
        valid = this.validateMessage(true) && valid
        valid = this.validateExpirationDate(true) && valid
        valid = this.validatePrivateKey(true) && valid
        
        this.was_validated = true
        if (!valid) {
          throw new Error("Error validating fields!");
        }
        let user = 'initminer'

        let opts = {}
        opts.addressPrefix = Config.STEEM_ADDRESS_PREFIX
        if(process.env.VUE_APP_CHAIN_ID) opts.chainId = process.env.VUE_APP_CHAIN_ID
        var client = new Client('', opts)
        var trx = {
          ref_block_num: 0,
          ref_block_prefix: 0,
          expiration: this.expiration_date,
          operations: [
            ['transfer',
              {
                from: user,
                to: user,
                amount: '0.001 ' + Config.STEEM_ADDRESS_PREFIX,
                memo: this.message
              }
            ]
          ],
          extensions: []
        }
        var sgnTrx = client.broadcast.sign(trx, PrivateKey.fromString(this.private_key))
        console.log(sgnTrx)
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

    validateBlock(submit) {
      let self = this
      return this.validateField('block', submit, function(){
        
      })
    },

    validateTx(submit) {
      let self = this
      return this.validateField('tx', submit, function(){
        
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
