<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Keys</h2>
      <table class="table">
        <thead>
          <tr class="table-primary">
            <th scope="col">#</th>
            <th scope="col">University</th>
            <th scope="col">Course</th>
            <th scope="col">Public Key</th>
            <th scope="col">Private Key</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(key,index) in keys"
            v-bind:key="index"
            v-bind:value="index"
          >
            <td>{{ index+1 }}</td>
            <td>{{ key.university }}</td>
            <td>{{ key.course }}</td>
            <td>{{ key.public_key }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="form-group row">
        <div class="col-md-5">
          <input class="form-control" type="text" id="input_university"
            v-model="university" placeholder="University" :class="{'is-invalid': error.university }"/>
          <div v-if="error.university" class="invalid-feedback">{{ errorText.university }}</div>
        </div>
        <div class="col-md-5">
          <input class="form-control" type="text" id="input_course"
            v-model="course" placeholder="Course" :class="{'is-invalid': error.course }"/>
          <div v-if="error.course" class="invalid-feedback">{{ errorText.course }}</div>
        </div>
        <div class="col-md-2">
          <button @click="create_keys" class="btn btn-primary" :disabled="sending"><div v-if="sending" class="mini loader"></div>Create keys</button>
        </div>
      </div>            
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
import Alerts from '@/mixins/Alerts'

export default {
  name: 'Proof',

  data() {
    return {
      keys: [],

      university: '',
      course: '',

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
    HeaderEFTG
  },

  mixins: [
    Alerts
  ],

  created() {
    this.loadKeys()
  },

  methods: {
    async loadKeys() {
      var response = await axios.get(Config.SERVER_API + "get_keys")
      this.keys = response.data
    },

    async create_keys() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        var data = {
          university: this.university,
          course: this.course
        }
        var response = await axios.post(Config.SERVER_API + "create_keys", data)
        this.showSuccess('Keys created')
        this.loadKeys()
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }

      this.sending = false
      this.hideInfo()
    },

    onLogin() {},
    onLogout() {}
  },
}

</script>
