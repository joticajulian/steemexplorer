<template>
  <div>
    <b-modal ref="modalBadge" hide-footer title="Badge">
      <h2>{{badge.course}}</h2>
      <h3>{{badge.university}}</h3>
      <div v-if="badge.pending" class="text-danger mt-3">
        Pending course
        <div class="row mt-3">
          <div class="col-md-5">
            <input class="form-control" type="text" id="input_badge_url"
              v-model="badge_url" placeholder="Badge"/>
          </div>
          <div class="col-md-2">
            <button @click="add_badge" class="btn btn-primary" :disabled="sending"><div v-if="sending" class="mini loader"></div>Add badge</button>
          </div>
        </div>
      </div>
      <router-link v-else :to="badge.badge.link">Link to explorer</router-link>
    </b-modal>

    <b-modal ref="modalKeys" hide-footer title="Keys">
      <h4>Public key</h4>
      <span class="public-key">{{key.public_key}}</span>
      <div v-if="show_private_key">
        <h4 class="mt-3">Private key</h4>
        <span class="public-key">{{key.private_key}}</span>
      </div>
      <button class="btn btn-danger col-12 mt-2" 
        @click="toggleKey"
      >{{show_private_key?'Hide':'Show private key'}}</button>
    </b-modal>

    <b-modal ref="modalCreateKeys" hide-footer title="Create Keys">
      <select class="form-control" v-model="create_key_issuer">
        <option v-for="(opt,key) in issuers" :value="opt.name">{{opt.name}}</option>
      </select>
      <select class="form-control" v-model="create_key_course">
        <option v-for="(opt,key) in courses" :value="opt.name">{{opt.name}}</option>
      </select>
      <button @click="create_keys" class="btn btn-primary" :disabled="sending"><div v-if="sending" class="mini loader"></div>Create keys</button>
    </b-modal>

    <b-modal ref="modalProof" hide-footer title="Create proof">
      <CreateProof :badge="key.badge"></CreateProof>
    </b-modal>

    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Courses</h2>
      <div role="tablist">
        <b-card 
          v-for="(course,index) in keys"
          v-bind:key="index"
          v-bind:value="index"class="mb-1"
        >
          <div role="tab" v-b-toggle="'accordion'+index">
            <div class="card-title">{{course.course}}</div>
            <div class="card-subtitle text-muted">{{course.university}}</div>
          </div>
          <b-collapse :id="'accordion'+index" visible accordion="my-accordion" role="tabpanel">
            <div class="card-text mt-3 mb-2" :class="{'text-primary':course.pending, 'text-success':!course.pending}">{{course.status}}</div>
            <div class="card-text">
              <div class="row">
                <div class="col-4">
                <button class="btn btn-primary col-12" @click="showKeys(course)">Keys</button>
                </div>
                <div class="col-4">
                <button class="btn col-12" :class="{'btn-primary':!course.pending, 'btn-secondary':course.pending}" @click="showBadge(course)">Badge</button>
                </div>
                <div class="col-4" v-if="!course.pending">
                <button class="btn btn-primary col-12" @click="generateProof(course)">Proof</button>
                </div>
              </div>
            </div>
          </b-collapse>
        </b-card>
      </div>
      <button @click="showModalCreateKey" class="btn btn-primary mt-3 mb-3">Add</button>     
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
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
import CreateProof from '@/components/CreateProof'
import Alerts from '@/mixins/Alerts'

import dev_data from '@/assets/dev_data.json'

export default {
  name: 'Proof',

  data() {
    return {
      keys: [],
      badge: { badge: {} },
      badge_url: '',
      key: {},
      show_private_key: false,

      create_key_issuer: '',
      create_key_course: '',

      courses: [],
      issuers: [],

      sending: false,
      error: {
        university: false,
        course: false
      },
      errorText: {
        university: '',
        course: ''
      },
      EXPLORER: Config.EXPLORER,
    }
  },

  components: {
    HeaderEFTG,
    CreateProof
  },

  mixins: [
    Alerts
  ],

  created() {
    this.loadKeys()
    this.debounced_loadCourses = debounce(this.loadCourses, 300)
  },

  watch: {
    create_key_issuer: function() {
      this.debounced_loadCourses();
    },
    create_key_course: function() {
      console.log('course changed')
    }
  },

  methods: {
    async loadKeys() {
      if(process.env.VUE_APP_DEV){
        this.keys = dev_data.keys        
      }else{
        var response = await axios.get(Config.SERVER_API + "get_keys")
        this.keys = response.data
      }

      this.keys.forEach( (k)=>{
        if(k.badge) k.badge.link = this.EXPLORER + '@' + k.badge.issuer + '/' + k.badge.permlink
        if(k.pending) k.status = 'Pending'
        else k.status = 'Course finished'
      })
    },

    async loadCourses() {
      var issuer = this.issuers.find( (i)=>{ return i.name === this.create_key_issuer })
      var response = await axios.get(issuer.api + 'courses')
      this.courses = response.data
    },

    async create_keys() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        var data = {
          university: this.create_key_issuer,
          course: this.create_key_course
        }

        var response = await axios.post(Config.SERVER_API + "create_keys", data)          
        this.showSuccess('Keys created')
        this.loadKeys()
        this.$refs.modalCreateKeys.hide()
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }

      this.sending = false
      this.hideInfo()
    },

    async add_badge() {
      try{
        var data = { badge_url: this.badge_url } 
        var response = await axios.post(Config.SERVER_API + 'update_key', data)
        this.showSuccess('Badge added')
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    async showModalCreateKey() {
      this.$refs.modalCreateKeys.show()
      var response = await axios.get(Config.SERVER_API + 'issuers')
      this.issuers = response.data
    },

    showBadge(course) {
      this.badge = course
      this.$refs.modalBadge.show()
    },

    showKeys(course) {
      this.key = course
      this.show_private_key = false
      this.$refs.modalKeys.show()
    },

    generateProof(course) {
      this.key = course
      this.$refs.modalProof.show()
    },

    toggleKey(){
      this.show_private_key = !this.show_private_key
      console.log('toggle now is '+this.show_private_key)
    },

    onLogin() {},
    onLogout() {}
  },
}

</script>

<style scoped>

.public-key {
  font-family: monospace;
  font-size: 1.3rem;
  overflow-wrap: break-word;
}

</style>
