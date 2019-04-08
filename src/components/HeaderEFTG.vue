<template>
  <div>
    <div class="container-fluid bg-info">
      <div class="row pt-2 pb-2">
        <div class="col-12 text-center">
          EFTG is a pilot project to explore and test the capabilities of the Blockchain technology for sharing financial data in Europe. Materials listed on this portal are provided "as is", without warranty of any kind. <a href="https://ec.europa.eu/info/legal-notice_en">Legal Notice</a>  
        </div>                
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col d-flex justify-content-start">
          <div class="d-flex align-items-end">
            <div id="logo-ec"><router-link to="/"><img src="../assets/logo2018commissionname.png" /></router-link></div>            
          </div>
          <div class="d-flex align-items-end">
            <div id="logo-eftg" class="ml-2"><router-link to="/"><img src="../assets/logo-eftg.png" /></router-link></div>            
          </div>  
        </div>
      </div>
    </div>
    <b-modal ref="modalAuth" hide-footer title="Login">
      <AuthComponent ref="auth" v-on:login="onLogin" v-on:close="closeModalAuth"></AuthComponent>
    </b-modal>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/" class="nav-item nav-link"><div class="extra-padding"><font-awesome-icon icon="home" /></div></router-link>
        </li>
      </ul>
      <b-navbar v-if="$store.state.auth.logged" class="ml-auto d-lg-none" style="margin:0;">
        <ul class="navbar-nav">
          <b-nav-item-dropdown variant="link" size="lg" no-caret right>
            <template slot="button-content">
              <div id="image-profile" 
                v-bind:style="{ backgroundImage: 'url(' + $store.state.auth.imgUrl + ')' }"                  
              ></div>
            </template>
            <b-dropdown-header>{{$store.state.auth.user}}</b-dropdown-header>
            <b-dropdown-divider></b-dropdown-divider>
            <router-link :to="EXPLORER+'@'+$store.state.auth.user" class="dropdown-item no-a" style="border-bottom:0px;"><font-awesome-icon icon="user" class="mr-2"/>Profile</router-link>
            <router-link to="/password" class="dropdown-item no-a" style="border-bottom:0px;"><font-awesome-icon icon="key" class="mr-2"/>Change Password</router-link>     
            <b-dropdown-item @click="logout">Logout</b-dropdown-item>
          </b-nav-item-dropdown>
        </ul>
      </b-navbar>
      <b-navbar-nav v-else class="nav-link ml-auto d-lg-none">
        <button class="btn btn-primary" @click="login">Login</button>
      </b-navbar-nav>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link to="/oam-portal" class="nav-item nav-link"><div class="extra-padding">OAM Portal</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/explorer" class="nav-item nav-link"><div class="extra-padding">Explorer</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/map" class="nav-item nav-link"><div class="extra-padding">Map</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/search.html" class="nav-item nav-link"><div class="extra-padding">Investor Portal</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/witnesses" class="nav-item nav-link"><div class="extra-padding">Witnesses</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/faq" class="nav-item nav-link"><div class="extra-padding">FAQ</div></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-item nav-link"><div class="extra-padding">Contact</div></router-link>
          </li>
        </ul>
        <ul class="navbar-nav ml-auto">
          <li class="nav-item d-lg-block d-none">
            <div v-if="$store.state.auth.logged">
              <b-nav-item-dropdown size="lg" variant="link" no-caret right>
                <template slot="button-content">
                  <div id="image-profile" 
                    v-bind:style="{ backgroundImage: 'url(' + $store.state.auth.imgUrl + ')' }"                  
                  ></div>
                </template>
                <b-dropdown-header>{{$store.state.auth.user}}</b-dropdown-header>
                <b-dropdown-divider></b-dropdown-divider>
                <router-link :to="EXPLORER+'@'+$store.state.auth.user" class="dropdown-item no-a" style="border-bottom:0px;"><font-awesome-icon icon="user" class="mr-2"/>Profile</router-link>
                <router-link to="/password" class="dropdown-item no-a" style="border-bottom:0px;"><font-awesome-icon icon="key" class="mr-2"/>Change Password</router-link>
                <b-dropdown-item @click="logout">Logout</b-dropdown-item>
              </b-nav-item-dropdown>
            </div>
            <div v-else>
              <button class="btn btn-primary" @click="login">Login</button>
            </div>
          </li>
        </ul>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import AuthComponent from '@/components/Auth'
import Config from '@/config.js'

export default {
  name: "HeaderEFTG",
  props: {
    portal: "",
    showAuth: false
  },
  data() {
    return {
      showModal: false,
      EXPLORER: Config.EXPLORER
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
      this.$refs.modalAuth.show()
    },

    onLogin() {
      this.closeModalAuth()
      this.$emit('login')    
    },

    closeModalAuth() {
      this.$refs.modalAuth.hide()    
    },
    
    logout() {
      console.log("@" + this.$store.state.auth.user + " logout");
      this.$store.state.auth = {
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
      this.$emit('logout')
    }
  },
  components: {
    AuthComponent   
  },
  /*mixins: [
    Auth
  ],*/
};
</script>

<style scoped>
#header {
  padding: 10px;  
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}
#header .row{
  margin: 0px !important;
}

#logo-eftg {
  display: inline-block;
  height: 1.9rem;
}

#logo-eftg img {
  max-width: 100%;
  max-height: 100%;
}

#logo-ec {
  display: inline-block;
  height: 3.7rem;
}

#logo-ec img {
  max-width: 100%;
  max-height: 100%;
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
  vertical-align: middle;
}

.extra-padding {
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
}

</style>
