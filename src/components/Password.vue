<template>
  <div>
    <HeaderEFTG :showAuth="true" ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2>Change Password</h2>                            
      <div id="password-form" novalidate>      
        <div class="row">
          <div class="col-12">
            <ul>
              <li>The first rule of EFTG is: Do not lose your password.</li>
              <li>The second rule of EFTG is: Nobody can reset your password.</li>
              <li>The third rule of EFTG is: Nobody can recover your password.</li>
              <li>The fourth rule: If you can remember the password, it's not secure.</li>
              <li>The fifth rule: Use only randomly-generated passwords.</li>
              <li>The sixth rule: Do not tell anyone your password.</li>
              <li>The seventh rule: Always back up your password.</li>
            </ul>
          </div>
        </div>
          <div class="form-group row">
            <label for="inputUsername" class="col-md-2 col-form-label">USERNAME</label>
            <div class="col-md-6">
              <input class="form-control" type="text" id="inputIssuerName" 
                     v-model="$store.state.auth.user" placeholder="Username" disabled/>              
            </div>
          </div>
          <div class="form-group row">
            <label for="inputCurrentPassword" class="col-md-2 col-form-label">CURRENT PASSWORD</label>
            <div class="col-md-6">
              <input class="form-control" type="password" id="inputCurrentPassword" 
                     v-model="currentPassword" placeholder="Current password or owner key"
                     :class="{'is-invalid': error.currentPassword }"/>
              <div v-if="error.currentPassword" class="invalid-feedback">{{ errorText.currentPassword }}</div>       
            </div>
          </div>
          <div class="form-group row">
            <label for="inputNewPassword" class="col-md-2 col-form-label">NEW PASSWORD</label>
            <div class="col-md-6">
              <input class="form-control" type="password" id="inputNewPassword" 
                     v-model="newPassword" placeholder="New password"
                     :class="{'is-invalid': error.newPassword }"/>              
            </div>
          </div>
          <div class="form-group row">
            <label for="inputReNewPassword" class="col-md-2 col-form-label">RE-ENTER NEW PASSWORD</label>
            <div class="col-md-6">
              <input class="form-control" type="password" id="inputReNewPassword" 
                     v-model="reNewPassword" placeholder="New password"
                     :class="{'is-invalid': error.reNewPassword }"/>
              <div v-if="error.reNewPassword" class="invalid-feedback">{{ errorText.reNewPassword }}</div>
            </div>
          </div>
          <div class="form-check row">
            <input type="checkbox" class="form-check-input col-md-12"
                   id="checkBoxWarning1" v-model="warning1"
                   :class="{'is-invalid': error.warning1 }">
            <label class="form-check-label" for="checkBoxWarning1">I understand that lost passwords cannot be recovered</label>            
          </div>
          <div class="form-check row">
            <input type="checkbox" class="form-check-input col-md-12"
                   id="checkBoxWarning2" v-model="warning2"
                   :class="{'is-invalid': error.warning2 }">
            <label class="form-check-label" for="checkBoxWarning2">I have securely saved my new password</label>            
          </div>
          <div class="form-group row">
            <div class="col-12">
              <button v-on:click="updatePassword" class="btn btn-primary mt-2" :disabled="sending"
                ><div v-if="sending" class="mini loader"></div>Update Password
              </button>
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
import debounce from "lodash.debounce";

import Config from "@/config.js";
import Utils from "@/js/utils.js";
import { Client, PrivateKey } from 'eftg-dsteem'
import SteemClient from '@/mixins/SteemClient.js'
//import dsteemExtra from "@/js/dsteem-extra.js";

import HeaderEFTG from "@/components/HeaderEFTG";

export default {
  name: "Password",
  
  data() {
    return {
      sending: false,
      
      account: null,
      currentPassword: '',
      passwordType: '',
      newPassword: '',
      reNewPassword: '',
      username: '',
      warning1: false,
      warning2: false,
      error:{
        currentPassword: false,
        newPassword: false,
        reNewPassword: false,
        warning1: false,
        warning2: false,
      },
      errorText:{
        currentPassword: 'No error',
        newPassword: 'No error',
        reNewPassword: 'No error',
        warning1: 'No error',
        warning2: 'No error',
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
    //validate current password
    this.debounced_validateCurrentPassword = debounce(this.validateCurrentPassword, 300);

    if(this.$store.state.auth.logged) this.getUser()  
  },
  
  watch: {
    currentPassword: function() {
      this.debounced_validateCurrentPassword();
    },
    newPassword: function(newVal) {
      
      this.validateNewPassword()
      // TODO: help the user to put a good password
      
    },
    reNewPassword: function(newVal) {
      this.validateNewPassword()
    },
    warning1: function(checked) {
      this.validateWarning1()   
    },
    warning2: function(checked) {
      this.validateWarning2()
    }
  },
  
  methods: {
    updatePassword () {
      var valid = true
      valid = this.validateCurrentPassword() && valid;
      valid = this.validateNewPassword() && valid;
      valid = this.validateWarning1() && valid;
      valid = this.validateWarning2() && valid;
      
      if (!valid) {
        console.log("Error validating fields!");          
        this.showDanger('Error validating fields!');          
        return false;
      }
      
      var roles = {'owner':{},'active':{},'posting':{},'memo':{}}
      var key_auths = {}
      for(var role in roles) {
        var privKey = PrivateKey.fromLogin(
          this.$store.state.auth.user,
          this.newPassword,
          role
        )
        var pubKey = privKey.createPublic(Config.STEEM_ADDRESS_PREFIX).toString();
        roles[role] = {
          key_auths: [ [pubKey , 1] ],
          account_auths: [],
          weight_threshold: 1
        }   
      }
      
      var operation = ['account_update',{
        account: this.account.name,
        memo_key: roles.memo.key_auths[0][0],
        json_metadata: this.account.json_metadata,
        owner: roles.owner,
        active: roles.active,
        posting: roles.posting
      }]
      
      if(this.passwordType === 'master') {
        var privKey = PrivateKey.fromLogin(
          this.$store.state.auth.user,
          this.currentPassword,
          'owner'
        )
      } else {
        var privKey = PrivateKey.fromString(this.currentPassword)
      }
      
      this.sending = true
      this.hideSuccess()
      this.hideDanger()      
      this.showInfo('Updating password...')
      
      let self = this
      //this.client.broadcast.sendOperations([operation],privKey)
      this.steem_broadcast_sendOperations([operation],privKey)
      .then(function(response){
        self.showSuccess('Password updated!')
        self.hideInfo()
        self.sending = false
        console.log(response)
      })
      .catch(function(error){
        self.showDanger(error.message)
        self.hideInfo()
        self.sending = false
        console.log(error)
      })
    },

    onLogin() { 
      this.getUser()
    },

    onLogout() {
      this.account = null
    },
    
    async getUser(){
      //const accounts = await this.client.database.getAccounts([this.$store.state.auth.user])
      const accounts = await this.steem_database_call('get_accounts',[[this.$store.state.auth.user]])
      this.account = accounts[0] 
    },
    
    //validation
    validateCurrentPassword() {
      if(!this.account){
        this.error.currentPassword = true
        this.errorText.currentPassword = 'Please login.'
        return false
      }

      // validate if the input is the master key
      var privKey = PrivateKey.fromLogin(
          this.$store.state.auth.user,
          this.currentPassword,
          'owner'
        )
      var pubKey = privKey.createPublic(Config.STEEM_ADDRESS_PREFIX).toString();

      if(this.account.owner.key_auths[0][0] === pubKey){
        this.error.currentPassword = false
        this.errorText.currentPassword = 'No error'
        this.passwordType = 'master'
        return true
      }

      // validate if the input is the owner key
      try{
        var privKey = PrivateKey.fromString(this.currentPassword)
        var pubKey = privKey.createPublic(Config.STEEM_ADDRESS_PREFIX).toString();

        if(this.account.owner.key_auths[0][0] === pubKey){
          this.error.currentPassword = false
          this.errorText.currentPassword = 'No error'
          this.passwordType = 'owner'
          return true
        }
      }catch(error){}

      this.error.currentPassword = true
      this.errorText.currentPassword = 'Incorrect password.'
      return false
    },
    
    validateNewPassword() {
      if(this.newPassword === this.reNewPassword){
        this.error.newPassword = false
        this.error.reNewPassword = false
        this.errorText.newPassword = 'No error'
        this.errorText.reNewPassword = 'No error'
        return true
      } else {
        this.error.newPassword = true
        this.error.reNewPassword = true
        this.errorText.newPassword = "Password doesn't match"
        this.errorText.reNewPassword = "Password doesn't match"
        return false
      }
    },
    
    validateWarning1() {
      if(this.warning1){
        this.error.warning1 = false
        this.errorText.warning1 = 'No error'
        return true
      } else {
        this.error.warning1 = true
        this.errorText.warning1 = 'Check this field'
        return false
      } 
    },
    
    validateWarning2() {
      if(this.warning2){
        this.error.warning2 = false
        this.errorText.warning2 = 'No error'
        return true
      } else {
        this.error.warning2 = true
        this.errorText.warning2 = 'Check this field'
        return false
      }
    }   
  }
};
</script>