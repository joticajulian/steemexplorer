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
          <button @click="close"  class="btn btn-secondary" :disabled="aborting"><div v-if="aborting" class="mini loader"></div>Cancel</button>
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
import Config from "@/config.js";
import Utils from "@/js/utils.js";
import SteemClient from '@/mixins/SteemClient.js'

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
      }
    };
  },

  mixins: [
    SteemClient
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
        if(error.name === 'UserError' || error.name === 'PasswordError' || 
           error.name === 'RPCError'  || error.name === 'RPCFailRounds' || error.name === 'Abort'
        ) {
          self.showDanger(error.message)
        }else {
          self.showDanger('Password format mismatch')        
        }
        self.sending = false
        self.$emit('error')
      });
    },

    /**
     * Checks if the password or WIF is valid for that user
     */
    async login(_username, _password) {
    
      this.RPCnode_setMaxFails(1)
      this.RPCnode_setMaxFailRounds(2)

      // Check if the user exists      
      const accounts = await this.steem_database_call('get_accounts',[[_username]])
      if (accounts.length == 0){        
        var e = new Error("User @" + _username + " does not exists");
        e.name = "UserError";
        throw e;
      }


      /* We check if the password is:
         1. WIF: the master key that generates the keys for all roles (owner, active, posting)
          or
         2. role key: The password could be the key for a specific role
      */

      // keysFromWIF: suppossing that password is WIF
      var keysFromWIF = {
        owner: { public: "", private: "" },
        active: { public: "", private: "" },
        posting: { public: "", private: "" }
      };

      for (var role in keysFromWIF) {
        keysFromWIF[role].private = PrivateKey.fromLogin(
          _username,
          _password,
          role
        );
        keysFromWIF[role].public = keysFromWIF[role].private
          .createPublic(Config.STEEM_ADDRESS_PREFIX)
          .toString();
      }
      
      // keysRole: suppossing that password is a specific role
      var keyRole = { public: "", private: "" };
      
      try{
        keyRole.private = PrivateKey.fromString(_password);
        keyRole.public = keyRole.private
          .createPublic(Config.STEEM_ADDRESS_PREFIX)
          .toString();
      }catch(error){}

      var roles = ["owner", "active", "posting"];
      //var roles = ["posting"];
      //let self = this;

      var account = accounts[0];
      var json_metadata = {}
      try{
        json_metadata = JSON.parse(account.json_metadata);
      }catch(error){

      }
      var keyFound = false;
      var typeOfPassword = "";
      var auth = {
        user: "",
        logged: false,
        imgUrl: "",
        keys: {
          owner: null,
          active: null,
          posting: null,
          memo: null
        }
      };

      // check owner, active and posting keys
      for (var i = 0; i < roles.length; i++) {
        role = roles[i];
        //multisignature: A specific role could have several keys
        var authority = account[role].key_auths;
        for (var j = 0; j < authority.length; j++) {
          var pubKey = authority[j][0];

          //save in 'auth' the valid keys
          if (pubKey === keysFromWIF[role].public) {
            auth.keys[role] = keysFromWIF[role].private;
            keyFound = true;
            typeOfPassword = "WIF";
          } else if (pubKey === keyRole.public) {
            auth.keys[role] = keyRole.private;
            keyFound = true;
            typeOfPassword = role;
          }
        }
      }

      if (!keyFound){
        var e = new Error("Incorrect password. Please use posting key or WIF");
        e.name = "PasswordError";
        throw e;
      }

      auth.logged = true;
      auth.user = _username;
      auth.imgUrl = Utils.extractUrlProfileImage(json_metadata);

      console.log("Correct " + typeOfPassword + " key");
      console.log("Welcome @" + _username);
      this.hideDanger()

      return auth;
    },

    close() {
      this.abortNodeConnection = true
      if(this.sending) this.aborting = true
      this.$emit("close");
    },

    getBestKeyForPosting() {
      if (this.auth.posting != null) return this.auth.posting;
      if (this.auth.active != null) return this.auth.active;
      if (this.auth.owner != null) return this.auth.owner;
      return null;
    }
  }
};
</script>

<style scoped>

</style>
