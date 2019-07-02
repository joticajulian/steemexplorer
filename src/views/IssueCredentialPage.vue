<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Issue Bagdes</h2>
      <div :class="{'was-validated':was_validated}" novalidate>
        <div class="form-group row">
          <label for="input_course" class="col-md-2 col-form-label">COURSE</label>
          <div class="col-md-10">
            <select class="form-control" id="input_course" v-model="course" :class="{'is-invalid': error.course }">
              <option disabled value="">Please select one</option>
              <option
                v-for="option in courses"
                v-bind:key="option.name"
                v-bind:value="option.name"
              >
                {{ option.name }}
              </option>
            </select>
            <div v-if="error.course" class="invalid-feedback">{{ errorText.course }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_award_date" class="col-md-2 col-form-label">AWARD DATE</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_award_date"
              v-model="award_date" placeholder="yyyy-mm-dd" :class="{'is-invalid': error.award_date }"/>
            <div v-if="error.award_date" class="invalid-feedback">{{ errorText.award_date }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_expiration_date" class="col-md-2 col-form-label">EXPIRATION DATE</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_expiration_date"
              v-model="expiration_date" placeholder="yyyy-mm-dd" :class="{'is-invalid': error.expiration_date }"/>
            <div v-if="error.expiration_date" class="invalid-feedback">{{ errorText.expiration_date }}</div>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_graduates" class="col-md-2 col-form-label">GRADUATES</label>
          <div class="col-md-10">
            <div class="row">
              <div class="col-md-6">
                <div class="card">
                  <ul class="list-group list-group-flush">
                    <li v-for="(student,index) in no_graduates" class="list-group-item" @click="selectStudent(index, 'no_graduates')">
                      <div>{{student.family_name}}, {{student.name}}</div>
                      <div><small>{{student.course_key.key}}</small></div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card">
                  <ul class="list-group list-group-flush">
                    <li v-for="(student,index) in graduates" class="list-group-item" @click="selectStudent(index, 'graduates')">
                      <div>{{student.family_name}}, {{student.name}}</div>
                      <div><small>{{student.course_key.key}}</small></div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button @click="issue_badges" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Issue</button>
            <div v-if="sending" class="btn">
              <button v-on:click="abort" class="btn btn-secondary mr-2" :disabled="aborting"><div v-if="aborting" class="mini loader"></div>Abort</button>
            </div>  
            <button v-on:click="clear"  class="btn btn-secondary btn-large">Clear</button>
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
import debounce from 'lodash.debounce'
import axios from 'axios'
import { PublicKey } from 'eftg-dsteem'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'IssueCredential',

  data() {
    return {
      courses: [],
      isAdmin: false,
      loadingAdmin: true,

      course: '',
      award_date: '',
      expiration_date: '',

      graduates: [],
      no_graduates: [],

      sending: false,
      error: {
        course: false,
        date: false,
        graduates: false,
      },
      errorText: {
        course: '',
        date: '',
        graduates: '',
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
    this.clear()
    this.loadCourses()

    //validate fields while typing
    this.debounced_validateAwardDate        = debounce(this.validateAwardDate       , 300)
    this.debounced_validateExpirationDate   = debounce(this.validateExpirationDate  , 300)
    this.debounced_loadStudents             = debounce(this.loadStudents            , 300)
  },

  watch: {
    award_date: function() { this.debounced_validateAwardDate() },
    expiration_date: function() { this.debounced_validateExpirationDate() },
    course: function() { this.debounced_loadStudents() }
  },

  methods: {
    async issue_badges() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        var course = this.courses.find( (c)=>{return c.name === this.course} )

        var valid = true;
        valid = this.validateAwardDate(true) && valid
        valid = this.validateExpirationDate(true) && valid

        this.was_validated = true
        if (!valid) {
          throw new Error("Error validating fields!");
        }

        var award_date = new Date(this.award_date + 'Z').toISOString().slice(0, -5)
        var expiration_date = new Date(this.expiration_date + 'Z').toISOString().slice(0, -5)

        this.graduates.forEach( (graduate)=>{
          graduate.start_date = new Date(graduate.course_key.start_date + 'Z').toISOString().slice(0, -5)
          graduate.award_date = award_date
          graduate.expiration_date = expiration_date
          graduate.key = graduate.course_key.key
        })

        var badges = {
          course: course,
          graduates: this.graduates
        }

        var response = await axios.post(Config.SERVER_API + "create_badges", badges)
        console.log(response.data)
        this.showSuccess('<a href="'+Config.EXPLORER+'b/'+response.data.block_num+'/'+response.data.id+'" class="alert-link" target="_blank">New diplomas issued!</a>')
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }

      this.sending = false
      this.hideInfo()
    },

    clear() {
      this.award_date = new Date().toISOString().slice(0,-14)
      this.expiration_date = new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0,-14)
      this.course = ''
      
      this.was_validated = false

      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()
    },

    getGraduatePublicKeys() {
      var lines = this.graduates.split(/\r?\n/)
      var pubKeys = []
      for(var i in lines){
        var pubKeyString = lines[i].replace(/\s/g,'')
        if(pubKeyString === '') continue
        try{
          var pubKey = PublicKey.fromString(pubKeyString)
        }catch(error){
          throw new Error('Error with public key '+pubKeyString+': '+error.message)
        }
        pubKeys.push(pubKeyString)
      }
      return pubKeys
    },

    createDiplomas( issuer, postingKey, course, date, graduatePubKeys ) {
      var claim = {
        context: [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1'
        ],

        id: 'http://example.edu/credentials/1872',
        type: ['DiplomaCredential'],
        issuer: issuer,
        issuanceDate: date,
        credentialCourse: {
          id: 'did:diploma:'+issuer,
          pubKeys: graduatePubKeys
        }
      }

      return claim
    },

    async loadCourses() {
      try{
        var response = await axios.get(Config.SERVER_API + "courses")
        console.log(response.data.length)
        this.courses = response.data

        console.log('load courses')
        console.log(this.courses)
      }catch(error){
        console.log(error)
      }
      this.loadingAdmin = false
    },

    async loadStudents() {
      try{
        var filter = {keys:{$all:[{$elemMatch:{course:this.course}}]}}
        var response = await axios.post(Config.SERVER_API + "students", filter)
        console.log(response.data.length)
        var students = response.data
        students.forEach( (s)=>{
          s.course_key = s.keys.find( (k)=>{return k.course === this.course} )
        })
        this.no_graduates = response.data
        this.graduates = []

        console.log('load students')
        this.isAdmin = true
      }catch(error){
        console.log(error)
      }
      this.loadingAdmin = false
    },

    selectStudent(index, clickOn) {
      if(clickOn === 'graduates') {
        var from = 'graduates'
        var to =   'no_graduates'
      }else{
        var from = 'no_graduates'
        var to =   'graduates'
      }
      var students = this[from].splice(index, 1)
      var student = students[0]
      if(student) {
        this[to].push( student )
      }
    },

    onLogin() {},
    onLogout() {},

    abort() {
      this.abortNodeConnection = true
      if(this.sending) this.aborting = true
    },

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

    // validation
    validateAwardDate(submit) {
      let self = this
      return this.validateField('award_date', submit, function(){
        var d = new Date(self.award_date + 'Z').toISOString().slice(0, -14)
        if(d !== self.award_date) throw new Error('Incorrect date')
      })
    },

    validateExpirationDate(submit) {
      let self = this
      return this.validateField('expiration_date', submit, function(){
        var d = new Date(self.expiration_date + 'Z').toISOString().slice(0, -14)
        if(d !== self.expiration_date) throw new Error('Incorrect date')
      })
    },
  },
}

</script>
