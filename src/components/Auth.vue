<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header"><slot name="header">Login</slot></header>
      <section class="modal-body">
        <div>
          <div class="prefix">@</div>
          <input
            type="text"
            v-model="username"
            placeholder="Enter your username"
          />
        </div>
        <div>
          <input
            type="password"
            v-model="password"
            placeholder="Password or WIF"
          />
        </div>
        <!--
          <div>
            <input type="checkbox" id="save-password" v-model="savePassword" />
            <label for="save-password">Keep me logged in</label>
          </div>
        -->
        <div>
          <button @click="try_to_login">Login</button>
          <button @click="close">Cancel</button>
        </div>
        <div v-if="error" class="dangertext">{{ errorText }}</div>
      </section>
    </div>
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
        self.errorText = error.message;
      });
    },

    /**
     * Checks if the password or WIF is valid for that user
     */
    async login(_username, _password) {
      /*We check if the password is:
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

      // keysRole: suppossing that password is a specific role
      var keyRole = { public: "", private: "" };

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
      keyRole.private = dsteem.PrivateKey.fromString(_password);
      keyRole.public = keyRole.private
        .createPublic(Config.STEEM_ADDRESS_PREFIX)
        .toString();

      var client = new dsteem.Client(Config.RPC_NODE.url);
      //var roles = ["owner", "active", "posting"];
      var roles = ["posting"];
      //let self = this;

      const accounts = await client.database.getAccounts([_username]);
      if (accounts.length === 0)
        throw new Error("user @" + _username + " does not exists");

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

      //check owner, active and posting keys
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

      if (!keyFound) throw new Error("incorrect posting key or WIF");

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
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px;
  display: flex;
}

.modal-header {
  color: #4aae9b;
  justify-content: space-between;
}

.modal-body {
  position: relative;
  padding: 20px 10px;
}

.btn-close {
  border: none;
  font-size: 20px;
  padding: 20px;
  cursor: pointer;
  font-weight: bold;
  color: #4aae9b;
  background: transparent;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}

.prefix {
  display: inline-block;
}

.dangertext {
  color: red;
}
</style>
