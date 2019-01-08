<template>
  <div class="container">
    <form novalidate>
      <div class="form-group row">
        <label for="inputUsername" class="col-md-4 col-form-label">USERNAME</label>
        <div class="col-md-8">
          <input class="form-control" type="text" id="inputUsername" 
             v-model="username" placeholder="Enter your username"/>        
        </div>
      </div>
      <div class="form-group row">
        <label for="inputPassword" class="col-md-4 col-form-label">PASSWORD</label>
        <div class="col-md-8">
          <input class="form-control" type="password" id="inputPassword" 
             v-model="password" placeholder="Password or WIF"/>        
        </div>
      </div>
      <div class="row">
        <div class="form-group col-md-12 align-bottom" style="padding-top: 8px;">
          <button @click="try_to_login" class="btn btn-primary eftg-btn-primary">Login</button>
          <button @click="close"  class="btn btn-secondary eftg-btn-primary">Cancel</button>
        </div>
      </div>
      <div v-if="error"  class="alert alert-danger" role="alert">{{errorText}}</div>   
    </form>
  </div>  
</template>

<script>
import Config from "@/config.js";
import Utils from "@/js/utils.js";

export default {
  name: "Auth",

  data() {
    return {
      username: "",
      password: "",
      //savePassword: false,
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
      },
      error: false,
      errorText: "No error"
    };
  },

  methods: {
    try_to_login() {
      let self = this;
      async function main() {
        var auth = await self.login(self.username, self.password);
        if (auth.logged) {
          self.$emit("login", auth);
          self.$emit("close");

          //save password in the browser if the user asks for it
          /*if (self.savePassword) {
            localStorage.username = self.username;
            localStorage.password = self.password;
          }*/
        }
      }
      main().catch(function(error) {
        self.error = true;
        console.log(error);
        if(error.name == 'UserError') {
          self.errorText = error.message;
        }else if(error.name == 'PasswordError'){
          self.errorText = error.message;
        }else {
          self.errorText = 'Password format mismatch';        
        }                
      });
    },

    /**
     * Checks if the password or WIF is valid for that user
     */
    async login(_username, _password) {
    
      if (_username === ''){
        var e = new Error("Please insert your username");
        e.name = "UserError";
        throw e;
      }
      
      // Check if the user exists      
      var client = new dsteem.Client(Config.RPC_NODE.url);
      const accounts = await client.database.getAccounts([_username]);
      if (accounts.length === 0){        
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
        //owner: { public: "", private: "" },
        //active: { public: "", private: "" },
        posting: { public: "", private: "" }
      };

      for (var role in keysFromWIF) {
        keysFromWIF[role].private = dsteem.PrivateKey.fromLogin(
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
        keyRole.private = dsteem.PrivateKey.fromString(_password);
        keyRole.public = keyRole.private
          .createPublic(Config.STEEM_ADDRESS_PREFIX)
          .toString();
      }catch(error){}

      //var roles = ["owner", "active", "posting"];
      var roles = ["posting"];
      //let self = this;

      var account = accounts[0];
      var json_metadata = JSON.parse(account.json_metadata);
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
      this.error = false;
      this.errorText = "No error";

      return auth;
    },

    close() {
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
