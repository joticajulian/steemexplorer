<template
  ><div>
    <div id="header">
      <div id="brand">
        <div id="logo"><img src="../assets/logo-eftg.png" /></div>
        <div class="powered">
          <div>OAM Portal</div>
          <div class="secondary-text">Powered by Blockchain</div>
        </div>
      </div>
      <div id="auth">
        <div v-if="auth.logged">
          <div
            id="image-profile"
            v-bind:style="{ backgroundImage: 'url(' + auth.imgUrl + ')' }"
          >
            <!--
              <div v-if="validImageUrl(auth.imgUrl)">
                <img :src="auth.imgUrl" />
              </div>
              <div v-else><img src="../assets/no-picture-profile.png" /></div>
            -->
          </div>
          <button @click="logout">Logout</button>
        </div>
        <div v-else><button @click="login">Login</button></div>
      </div>
      <div v-if="showModal">
        <Auth
          ref="auth"
          v-on:login="auth = $event;"
          v-on:close="showModal = false;"
        >
        </Auth>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from "@/components/Auth";

export default {
  name: "HeaderEFTG",
  data() {
    return {
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
      showModal: false
    };
  },
  mounted() {
    this.autologin();
  },
  methods: {
    async autologin() {
      //todo: where to save username and password? localStorage is not secure
      /*if (localStorage.username && localStorage.password) {
        var auth = await this.$refs.auth.login(
          localStorage.username,
          localStorage.password
        );
        if (auth.logged) {
          this.auth = auth;
        }
      }*/
    },

    login() {
      this.showModal = true;
    },
    logout() {
      console.log("@" + this.auth.user + " logout");
      this.auth = {
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
      localStorage.removeItem("username");
      localStorage.removeItem("password");
    },
    validImageUrl(url) {
      return url && url.length > 0; //todo: validate the whole path
    }
  },
  components: {
    Auth
  }
};
</script>

<style scoped>
#header {
  padding: 10px;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

#logo {
  display: inline-block;
  height: 2rem;
}

#logo img {
  max-width: 100%;
  max-height: 100%;
}

#brand {
  display: inline-block;
}

#auth {
  display: flex;
  justify-content: flex-end;
  float: right;
  align-items: center;
  height: 2rem;
  max-height: 100%;
  //display: inline-block;
  //float:right;
}

#auth div {
  max-height: 100%;
  vertical-align: middle;
}

#image-profile {
  display: inline-block;
  height: 2rem;
  width: 2rem;
  margin-right: 5px;
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  border-radius: 50%;
  //padding: 7px;
}

.powered {
  display: inline-block;
  margin-left: 10px;
  font-size: 0.6rem;
}
</style>
