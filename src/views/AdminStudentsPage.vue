<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Admin Students</h2>
      <div v-if="isAdmin" class="mb-2">
        <div class="row">
          <div class="col-md-3">
            <div class="card mb-2">
              <ul class="list-group list-group-flush">
                <li v-for="(student,index) in students" class="list-group-item" @click="selectStudent(index)">
                  {{student.name}}
                </li>
              </ul>
            </div>
            <button class="btn btn-primary mr-2" @click="addStudent">Add</button>
            <button class="btn btn-primary" @click="loadStudents">Refresh</button>
          </div>
          <div class="col">
            <div v-if="editing || addingNew">
              <h3>{{editing?'Edit':'New student'}}</h3>
              <div :class="{'was-validated':was_validated}" novalidate>
                <div class="form-group row">
                  <label for="input_name" class="col-md-2 col-form-label">NAME</label>
                  <div class="col-md-10">
                    <input class="form-control" type="text" id="input_name"
                      v-model="name" placeholder="Name" :class="{'is-invalid': error.name }"/>
                    <div v-if="error.name" class="invalid-feedback">{{ errorText.name }}</div>
                  </div>
                </div>
                <div class="form-group row">
                  <label for="input_family_name" class="col-md-2 col-form-label">FAMILY NAME</label>
                  <div class="col-md-10">
                    <input class="form-control" type="text" id="input_family_name"
                      v-model="family_name" placeholder="Family Name" :class="{'is-invalid': error.family_name }"/>
                    <div v-if="error.family_name" class="invalid-feedback">{{ errorText.family_name }}</div>
                  </div>
                </div>
                <div class="form-group row">
                  <label for="input_address" class="col-md-2 col-form-label">ADDRESS</label>
                  <div class="col-md-10">
                    <input class="form-control" type="text" id="input_address"
                      v-model="address" placeholder="Address" :class="{'is-invalid': error.address }"/>
                    <div v-if="error.address" class="invalid-feedback">{{ errorText.address }}</div>
                  </div>
                </div>
                <div class="form-group row">
                  <label for="input_username" class="col-md-2 col-form-label">USERNAME</label>
                  <div class="col-md-10">
                    <input class="form-control" type="text" id="input_username"
                      v-model="username" placeholder="" :class="{'is-invalid': error.username }"/>
                    <div v-if="error.username" class="invalid-feedback">{{ errorText.username }}</div>
                  </div>
                </div>
                <div class="form-group row">
                  <label for="input_password" class="col-md-2 col-form-label">PASSWORD</label>
                  <div class="col-md-10">
                    <input class="form-control" type="text" id="input_password"
                      v-model="password" placeholder="" :class="{'is-invalid': error.password }"/>
                    <div v-if="error.password" class="invalid-feedback">{{ errorText.password }}</div>
                  </div>
                </div>
                <button class="btn btn-primary mr-2" @click="updateStudent">{{editing?'Update':'Add student'}}</button>
                <button class="btn btn-secondary" @click="closeUpdate">Cancel</button>
              </div>
            </div>
            <div v-else>
              <div v-if="current">
                <h4>{{current.name}} {{current.family_name}}</h4>
                <h5>{{current.address}}</h5>
                <h4 class="mt-4">Keys</h4>
                <div class="card">
                  <ul class="list-group list-group-flush">
                    <li v-for="(key,index) in current.keys" class="list-group-item" @click="selectKey(index)">
                      <div class="row">
                        <div class="col-11">
                          {{key.key}}
                          <div class="row">
                            <div class="col-3">{{key.course}}</div>
                            <div class="col-9">{{key.start_date}}</div>
                          </div>
                        </div>
                        <div class="col-1">
                          <button v-if="selectedKey == index" class="btn btn-primary" @click="removeKey(index)">Remove</button>
                        </div>                        
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-if="addingKey" class="form-group row mt-2">
                  <div class="col-md-3">
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
                  </div>
                  <div class="col-md-3">
                    <input class="form-control" type="text" id="input_start_date"
                      v-model="start_date" placeholder="yyyy-mm-dd" :class="{'is-invalid': error.start_date }"/>
                    <div v-if="error.start_date" class="invalid-feedback">{{ errorText.start_date }}</div>
                  </div>
                  <div class="col-md-6">
                    <input class="form-control" type="text" id="input_newkey"
                      v-model="newkey" placeholder="Key" :class="{'is-invalid': error.newkey }"/>
                    <div v-if="error.newkey" class="invalid-feedback">{{ errorText.newkey }}</div>
                  </div>
                </div>
                <button class="btn btn-primary mt-2" @click="addKey">Add key</button>
                <div class="mt-3">
                  <button class="btn btn-primary mr-2" @click="editStudent">Edit student</button>
                  <button class="btn btn-primary" @click="removeStudent">Remove student</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-if="loadingAdmin" class="loader"></div>
        <div v-else>
          <p>Restringed access: Please login as admin</p>
        </div>
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Config from '@/config.js'
import Utils from '@/js/utils.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'
import Alerts from '@/mixins/Alerts.js'

export default {
  name: 'AdminStudentsPage',

  data() {
    return {
      isAdmin: false,
      loadingAdmin: true,

      students: [],
      current: null,
      selectedKey: -1,

      name: '',
      family_name: '',
      address: '',
      username: '',
      password: '',

      courses: [],
      newkey: '',
      course: '',
      start_date: '',

      editing: false,
      addingNew: false,
      addingKey: false,

      was_validated: false,
      error:{
        name: false,
        family_name: false,
        address: false,
        username: false,
        password: false,

        newkey: false,
        course: false,
        start_date: false
      },
      errorText:{
        name: '',
        family_name: '',
        address: '',
        username: '',
        password: '',

        newkey: '',
        course: '',
        start_date: ''
      }
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    Alerts
  ],

  created() {
    this.loadStudents()
    this.loadCourses()
  },

  methods: {
    async loadStudents() {
      try{
        var response = await axios.get(Config.SERVER_API + "students")
        console.log(response.data.length)
        var students = response.data
        this.students = []
        for(var i in response.data)
          this.$set(this.students, i, response.data[i])

        this.reloadCurrent()
        console.log('load students9')
        console.log(this.students)
        this.isAdmin = true
      }catch(error){
        console.log(error)
      }
      this.loadingAdmin = false
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
    },

    selectStudent(id) {
      this.current = this.students[id]
      this.closeUpdate()
    },

    addStudent() {
      this.addingNew = true
    },

    async removeStudent() {
      try{
        var student = {_id: this.current._id}
        await axios.post(Config.SERVER_API + 'remove_user', student)
        //await this.delay(5000)
        this.showSuccess('Removed')
        this.loadStudents()
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    editStudent() {
      this.editing = true
      this.fillForm()
    },

    fillForm() {
      this.name = this.current.name
      this.family_name = this.current.family_name
      this.address = this.current.address
      this.username = this.current.username
      this.password = this.current.password
    },

    reloadCurrent() {
      if(!this.current) return
      this.current = this.students.find( (s)=>{ return s._id === this.current._id } )
    },

    async updateStudent() {
      try{

        if(this.addingNew){
          var student = {
            name: this.name,
            family_name: this.family_name,
            address: this.address,
            username: this.username,
            password: this.password,
            role: 'student',
            keys: []
          }

          await axios.post(Config.SERVER_API + 'add_user', student)
          this.showSuccess('Added')
          this.addingNew = false
        }
        else if(this.editing) {
          var data = {
            filter: {
              _id: this.current._id
            },
            update: {
              $set:{
                name: this.name,
                family_name: this.family_name,
                address: this.address,
                username: this.username,
                password: this.password
              }
            }
          }
          console.log(data)

          await axios.post(Config.SERVER_API + 'update_user', data)
          this.showSuccess('Student updated')
          this.editing = false
        }
        await this.loadStudents()
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    closeUpdate() {
      this.editing = false
      this.addingNew = false
      this.addingKey = false
    },

    async addKey() {
      if(!this.addingKey){
        this.addingKey = true
        this.start_date = new Date().toISOString().slice(0, -14)
        this.course = ''
        this.newkey = ''
        return
      }
      try{
        var data = {
          filter: {
            _id: this.current._id
          },
          update: {
            $push:{
              keys:{
                key: this.newkey,
                course: this.course,
                start_date: this.start_date
              }
            }
          }
        }
        await axios.post(Config.SERVER_API + 'update_user', data)
        this.showSuccess('Key added')
        this.addingKey = false
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    selectKey(index) {
      this.selectedKey = index
    },

    async removeKey(index) {
      try{
        var data = {
          filter: {
            _id: this.current._id
          },
          update: {
            $pull:{
              keys:{
                key: this.current.keys[index].key
              }
            }
          }
        }
        await axios.post(Config.SERVER_API + 'update_user', data)
        this.showSuccess('Key removed')
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    onLogin() {},
    onLogout() {},

    delay(duration) {
      //return new Promise(resolve => setTimeout(resolve, duration));
    },
  },
}

</script>
