<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Verify</h2>
      <div :class="{'was-validated':was_validated}" novalidate>
        <div class="form-group row">          
          <div class="col-md-12">
            <div class="custom-file">            
              <input type="file" class="custom-file-input" id="input_file" @change="validateFile" :class="{'is-invalid': error.file }">
              <label class="custom-file-label" for="input_file">Choose file...</label>
              <div v-if="error.file" class="invalid-feedback">{{ errorText.file }}</div>          
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button @click="verify" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Verify</button>
          </div>
        </div>
        <ul>
          <li v-for="message in messages">
            <font-awesome-icon :icon="message.ok?'check':'times'" class="mr-2"/> {{message.message}} <router-link v-if="message.link" :to=message.link.url>{{message.link.text}}</router-link>
          </li>
        </ul>
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
import { Client, PrivateKey, cryptoUtils, Signature } from 'eftg-dsteem'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'Verify',

  data() {
    return {
      file: '',
      messages: [],
      
      error: {
        file: false
      },
      errorText: {
        file: ''
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
    //validate fields while typing
    this.debounced_validateFile = debounce(this.validateFile, 300)
  },

  mounted() {
    this.startEventListenerFile()
  },

  watch: {
    file: function() { this.debounced_validateFile() },
  },

  methods: {
    async verify() {
      this.hideSuccess()
      this.hideDanger()

      var valid = true;
      valid = this.validateFile(true) && valid

      this.was_validated = true
      if (!valid) {
        throw new Error("Error validating fields!");
      }
      var pubKeys = []
      var localFile = document.getElementById("input_file").files[0]
      var fileData = await this.readFileAsBuffer(localFile)

      this.messages = []
      var verification = true
      var i = 0

      try{
        var data = JSON.parse(fileData.toString())
        console.log(data)
      }catch(error){
        this.messages[i++] = {ok: false, message: 'There is no data in JSON format'}
        verification = false
        return
      }

      if(data.proof) {
        try{
          var sgnTrx = data.proof
          var chainId = this.RPCnode_initClient().chainId
          if(sgnTrx.operations[0].length > 0){
            if(sgnTrx.operations[0][0] === 'transfer')
              this.messages[i++] = {ok: true, message: 'Message in the proof: '+sgnTrx.operations[0][1].memo}
          }else{
            this.messages[i++] = {ok: false, message: 'The proof does not contain operations'}
            verification = false
          }
          var expiration = new Date(sgnTrx.expiration + 'Z')
          if(new Date() <= expiration){
            this.messages[i++] = {ok: true, message: 'The proof has not expired ('+sgnTrx.expiration+')'}
          }else{
            this.messages[i++] = {ok: false, message: 'The proof has expired ('+sgnTrx.expiration+')'}
            verification = false
          }
          pubKeys = this.getSignatureKeys(sgnTrx,chainId)
          if(pubKeys.length == 0){
            this.messages[i++] = {ok: false, message: 'The proof has not been signed'}
            verification = false
          }else if(pubKeys.length == 1){
            this.messages[i++] = {ok: true, message: 'The proof has been signed by '+pubKeys[0]}
          }else{
            this.messages[i++] = {ok: true, message: 'The proof has been signed by the following keys: '+pubKeys}
          }
        }catch(error){
          this.messages[i++] = {ok: false, message: 'Problems reading the proof: '+error.message}
          console.log(error)
          verification = false
        }
      }else {
        this.messages[i++] = {ok: false, message: 'There is no proof in the file'}
        verification = false
      }

      if(data.badge) {
        if(data.badge.issuer && data.badge.permlink) {
          var url = '@'+data.badge.issuer+'/'+data.badge.permlink
          try{
            var content = await this.steem_database_call( 'get_content', [data.badge.issuer, data.badge.permlink] )
            if(!content) throw new Error('There is no content')
            if(content.json_metadata === '') throw new Error('There is no metadata')
            var metadata = JSON.parse(content.json_metadata)
            if(metadata && metadata.badge){
              this.messages[i++] = {ok: true, message: 'Badge found in the blockchain: ', link:{text:content.title, url:Config.EXPLORER+url}}
            }else{
              this.messages[i++] = {ok: false, message: 'There is no badge in ', link:{text:content.title, url:Config.EXPLORER+url}}
              verification = false
            }
            if(metadata && metadata.assertions){
              pubKeys.forEach( (pubKey) => {
                var assertion = metadata.assertions.find( (a)=>{ return a.recipient.identity === pubKey.toString() })
                if(assertion){
                  this.messages[i++] = {ok: true, message: 'The public key '+pubKey+' is present in the badge'}
                }else{
                  this.messages[i++] = {ok: false, message: 'The public key '+pubKey+' is not present in the badge'}
                  verification = false
                }
              })
            }else{
              this.messages[i++] = {ok: false, message: 'There are no assertions in the badge'}
              verification = false
            }
          }catch(error){
            this.messages[i++] = {ok: false, message: 'Problems reading the badge '+url+'. Reason: '+error.message}
            console.log(error)
            verification = false
          }
        }else{
          this.messages[i++] = {ok: false, message: 'The badge does not contain issuer and permlink'}
          verification = false
        }
      }else {
        this.messages[i++] = {ok: false, message: 'There is no badge in the file'}
        verification = false
      }

      if(verification){
        this.showSuccess('The proof is valid')
      }else{
        this.showDanger('Invalid proof')
      }
    },

    async readFileAsBuffer(inputFile, config = {}) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject(new DOMException("Problem parsing file to upload"));
        };
        reader.onload = () => {
          if(config.onLoad) config.onLoad()

          var dataArrayBuffer = reader.result;
          var dataBuffer = new Buffer(dataArrayBuffer);
          resolve(dataBuffer);
        };
        
        if(config.onProgress)  reader.onprogress  = config.onProgress
        if(config.onAbort)     reader.onabort     = config.onAbort
        if(config.onError)     reader.onerror     = config.onError
        if(config.onLoadStart) reader.onloadstart = config.onLoadStart
        if(config.onLoadEnd)   reader.onloadend   = config.onLoadEnd 
        
        reader.readAsArrayBuffer(inputFile);
      });
    },

    startEventListenerFile() {
      var input = document.getElementById("input_file");
      var label = input.nextElementSibling,
        labelVal = label.innerHTML;
      input.addEventListener("change", function(e) {
        var fileName = e.target.value.split("\\").pop();
        if (fileName) label.innerHTML = fileName;
        else label.innerHTML = labelVal;
      });
    },

    getSignatureKeys(trx,chainId){
      const digest = cryptoUtils.transactionDigest(trx,chainId)
      var keys = []
      for(var i in trx.signatures){
        var sig = trx.signatures[i]
        keys.push(Signature.fromString(sig).recover(digest))
      }
      return keys
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

    validateFile(submit) {
      if (submit && document.getElementById('input_file').files.length === 0) {
        this.showInvalid('file', 'Please select a file')
        return false
      }
      this.hideInvalid('file')
      return true
    },
  },
}

</script>
