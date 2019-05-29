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
                  <label for="input_email" class="col-md-2 col-form-label">EMAIL</label>
                  <div class="col-md-10">
                    <input class="form-control" type="text" id="input_email"
                      v-model="email" placeholder="" :class="{'is-invalid': error.email }"/>
                    <div v-if="error.email" class="invalid-feedback">{{ errorText.email }}</div>
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
              <h3>Student</h3>
              <div v-if="current">
                <div class="row">
                  <div class="col-3"><strong>Name</strong></div>
                  <div class="col">{{current.name}}</div>
                </div>
                <div class="row">
                  <div class="col-3"><strong>email</strong></div>
                  <div class="col">{{current.email}}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-3"><strong>Keys</strong></div>
                  <div class="col">
                    <div v-for="(key,index) in current.keys" class="row">
                      <div class="col-4">{{key.subject}}</div>
                      <div class="col">{{key.key}}</div>
                    </div>
                    <button class="btn btn-primary" @click="addKey">Add key</button>
                  </div>
                </div>
                <button class="btn btn-primary mr-2" @click="removeStudent">Remove student</button>
                <button class="btn btn-primary" @click="editStudent">Edit student</button>
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

      name: '',
      email: '',
      password: '',

      editing: false,
      addingNew: false,

      was_validated: false,
      error:{
        name: false,
        email: false,
        password: false
      },
      errorText:{
        name: '',
        email: '',
        password: ''
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
      this.email = this.current.email
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
            email: this.email,
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
              name: this.name,
              email: this.email,
              password: this.password
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
    },

    addKey() {},
    onLogin() {},
    onLogout() {},

    delay(duration) {
      //return new Promise(resolve => setTimeout(resolve, duration));
    },
  },
}

</script>
