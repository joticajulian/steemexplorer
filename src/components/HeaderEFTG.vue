<template>
  <div>
    <div class="container-fluid bg-info">
      <div class="row pt-2 pb-2">
        <div class="col-12 text-center">
          EFTG is a pilot project to explore and test the capabilities of the Blockchain technology for sharing financial data in Europe. Materials listed on this portal are provided "as is", without warranty of any kind.     
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
        <div v-if="showAuth" class="col d-flex justify-content-end">
          <div class="d-flex align-items-end"> 
            <div>           
              <div v-if="$store.state.auth.logged">
                <b-dropdown variant="link" size="lg" no-caret>
                  <template slot="button-content">
                    <div id="image-profile" 
                         v-bind:style="{ backgroundImage: 'url(' + $store.state.auth.imgUrl + ')' }"                  
                    ></div>
                  </template>
                  <b-dropdown-header>{{$store.state.auth.user}}</b-dropdown-header>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item href="#/password"><font-awesome-icon icon="key" class="mr-2"/>Change Password</b-dropdown-item>                  
                </b-dropdown>  
  
                <button class="btn btn-primary" @click="logout">Logout</button>
              </div>
              <div v-else>
                <button class="btn btn-primary" @click="login">Login</button>
                <b-modal ref="modalAuth" hide-footer title="Login">
                  <AuthComponent ref="auth" v-on:login="$emit('login')"></AuthComponent>
                </b-modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav class="navbar navbar-expand">
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-item nav-link"><font-awesome-icon icon="home" /></router-link>
          </li>
          <li class="nav-item">
            <router-link to="/oam-portal" class="nav-item nav-link">OAM Portal</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/explorer" class="nav-item nav-link">Explorer</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/map" class="nav-item nav-link">Map</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/search.html" class="nav-item nav-link">Investor Portal</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/faq" class="nav-item nav-link">FAQ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-item nav-link">Contact</router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-item nav-link" target="_blank" href="https://ec.europa.eu/info/legal-notice_en">Legal Notice</a>
          </li>
        </ul>
      </div>
    </nav>        
  </div>
</template>

<script>
import AuthComponent from "@/components/Auth"

export default {
  name: "HeaderEFTG",
  props: {
    portal: "",
    showAuth: false
  },
  data() {
    return {
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
      this.$refs.modalAuth.show()
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

</style>