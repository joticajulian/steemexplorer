<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Issue Credentials</h2>
      <div :class="{'was-validated':was_validated}" novalidate>
        <div class="form-group row">
          <label for="input_degree" class="col-md-2 col-form-label">DEGREE</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_degree"
              v-model="degree" placeholder="Degree" :class="{'is-invalid': error.degree }"/>
            <div v-if="error.degree" class="invalid-feedback">{{ errorText.degree }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_date" class="col-md-2 col-form-label">DATE</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_date"
              v-model="date" placeholder="dd/mm/yyyy" :class="{'is-invalid': error.date }"/>
            <div v-if="error.date" class="invalid-feedback">{{ errorText.date }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_graduates" class="col-md-2 col-form-label">GRADUATES</label>
          <div class="col-md-10">
            <textarea class="form-control" type="text" id="input_graduates" rows="10"
              v-model="graduates" :class="{'is-invalid': error.graduates }"/>
            <div v-if="error.graduates" class="invalid-feedback">{{ errorText.graduates }}</div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button @click="issue" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Issue</button>
            <div v-if="sending" class="btn">
              <button v-on:click="abort" class="btn btn-secondary mr-2" :disabled="aborting"><div v-if="aborting" class="mini loader"></div>Abort</button>
            </div>  
            <button v-on:click="clear"  class="btn btn-secondary btn-large">Clear</button>
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
import { PublicKey } from 'eftg-dsteem'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'IssueCredential',

  data() {
    return {

      degree: '',
      date: '',
      graduates: '',

      sending: false,
      error: {
        degree: false,
        date: false,
        graduates: false
      },
      errorText: {
        degree: '',
        date: '',
        graduates: ''
      },
      was_validated: false,

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

    //validate fields while typing
    this.debounced_validateDegree           = debounce(this.validateDegree          , 300)
    this.debounced_validateDate             = debounce(this.validateDate            , 300)
    this.debounced_validateGraduates        = debounce(this.validateGraduates       , 300)
  },

  watch: {
    degree: function() { this.debounced_validateDegree() },
    date: function() { this.debounced_validateDate() },
    graduates: function() { this.debounced_validateGraduates() },
  },

  methods: {
    async issue() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        if(!this.$store.state.auth.logged)
          throw new Error('Please login')

        var valid = true;
        valid = this.validateDegree(true) && valid
        valid = this.validateDate(true) && valid
        valid = this.validateGraduates(true) && valid

        this.was_validated = true
        if (!valid) {
          throw new Error("Error validating fields!");
        }

        var username = this.$store.state.auth.user
        var postingKey = this.$store.state.auth.keys.posting

        var date = Utils.dateToString( Utils.ddmmyyyytoDate(this.date) ) //.toISOString().slice(0, -5)
        var graduatePubKeys = this.getGraduatePublicKeys()
        var claim = this.createDiplomas( username, postingKey, this.degree, date, graduatePubKeys )

        var operation = [
          'custom_json',
          {
            required_auths: [],
            required_posting_auths: [username],
            id: 'credential',
            json: JSON.stringify(claim)
          }
        ]

        var result = await this.steem_broadcast_sendOperations([operation], postingKey)
        this.showSuccess('<a href="'+Config.EXPLORER+'b/'+result.block_num+'/'+result.id+'" class="alert-link" target="_blank">New diplomas issued!</a>')

      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }

      this.sending = false
      this.hideInfo()
    },

    clear() {
      var d = new Date()
      this.date = Utils.dateFormat(d)
      this.degree = ''
      this.graduates = ''

      this.was_validated = false

      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },

    getGraduatePublicKeys() {
      var lines = this.graduates.split(/\r?\n/)
      var pubKeys = []
      for(var i in lines){
        var pubKeyString = lines[i].replace(/\s/g,'')
        if(pubKeyString === '') continue
        try{
          var pubKey = PublicKey.fromString(pubKeyString)
        }catch(error){
          throw new Error('Error with public key '+pubKeyString+': '+error.message)
        }
        pubKeys.push(pubKeyString)
      }
      return pubKeys
    },

    createDiplomas( issuer, postingKey, degree, date, graduatePubKeys ) {
      var claim = {
        context: [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1'
        ],

        id: 'http://example.edu/credentials/1872',
        type: ['DiplomaCredential'],
        issuer: issuer,
        issuanceDate: date,
        credentialSubject: {
          id: 'did:diploma:'+issuer,
          pubKeys: graduatePubKeys
        }
      }

      return claim
    },

    onLogin() {},
    onLogout() {},

    abort() {
      this.abortNodeConnection = true
      if(this.sending) this.aborting = true
    },

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
    validateDegree(submit) {
      let self = this
      return this.validateField('degree', submit, function(){
        // validation
      } )
    },

    validateDate(submit) {
      let self = this
      return this.validateField('date', submit, function(){
        Utils.ddmmyyyytoDate(self.date).toISOString().slice(0, -5)
      } )
    },

    validateGraduates(submit) {
      let self = this
      return this.validateField('graduates', submit, function(){
        self.getGraduatePublicKeys()
      })
    },
  },
}

</script>
