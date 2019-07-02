<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Create proof</h2>
      <div :class="{'was-validated':was_validated}" novalidate>
        <div class="form-group row">
          <label for="input_badge_url" class="col-md-2 col-form-label">BADGE URL</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_badge_url"
              v-model="badge_url" placeholder="Link to the badge" :class="{'is-invalid': error.badge_url }"/>
            <div v-if="error.badge_url" class="invalid-feedback">{{ errorText.badge_url }}</div>
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
import { saveAs } from 'file-saver'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import HeaderEFTG from '@/components/HeaderEFTG'
import Alerts from '@/mixins/Alerts'

export default {
  name: 'Proof',

  data() {
    return {
      badge_url: '',
      message: '',
      expiration_date: '',

      sending: false,
      error: {
        badge_url: false,
        message: false,
        expiration_date: false,
      },
      errorText: {
        badge_url: '',
        message: '',
        expiration_date: '',
      },
      was_validated: false,
      EXPLORER: Config.EXPLORER,
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    Alerts
  ],

  created() {
    this.expiration_date = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, -5)

    //validate fields while typing
    this.debounced_validateBadgeUrl       = debounce(this.validateBadgeUrl       , 300)
    this.debounced_validateMessage        = debounce(this.validateMessage        , 300)
    this.debounced_validateExpirationDate = debounce(this.validateExpirationDate , 300)
  },

  watch: {
    badge_url: function() { this.debounced_validateBadgeUrl() },
    message: function() { this.debounced_validateMessage() },
    expiration_date: function() { this.debounced_validateExpirationDate() },
  },

  methods: {
    async create_proof() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        var valid = true;
        valid = this.validateBadgeUrl(true) && valid
        valid = this.validateMessage(true) && valid
        valid = this.validateExpirationDate(true) && valid

        this.was_validated = true
        if (!valid) {
          throw new Error("Error validating fields!");
        }
        var data = {
          badge_url: this.badge_url,
          message: this.message,
          expiration_date: this.expiration_date
        }
        var response = await axios.post(Config.SERVER_API + "create_proof", data)
        var presentation = response.data
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

    validateBadgeUrl(submit) {
      let self = this
      return this.validateField('badge_url', submit, function(){
        
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

  },
}

</script>
