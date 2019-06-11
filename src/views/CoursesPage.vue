<template>
  <div>
    <HeaderEFTG ref="headerEFTG" v-on:login="changeLogin" v-on:logout="changeLogin"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">Courses</h2>
      
      <div class="row">
        <div class="col-md-3">
          <div class="card mb-2">
            <ul class="list-group list-group-flush">
              <li v-for="(course,index) in courses" class="list-group-item" @click="selectCourse(index)">
                {{course.name}}
              </li>
            </ul>
          </div>
          <div v-if="isAdmin" class="mb-2">
            <button class="btn btn-primary mr-2" @click="addCourse">Add</button>
            <button class="btn btn-primary" @click="loadCourses">Refresh</button>
          </div>
        </div>
        <div class="col">
          <div v-if="(editing || addingNew) && isAdmin">
            <h3>{{editing?'Edit':'New course'}}</h3>
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
                <label for="input_description" class="col-md-2 col-form-label">DESCRIPTION</label>
                <div class="col-md-10">
                  <input class="form-control" type="text" id="input_description"
                    v-model="description" placeholder="Description" :class="{'is-invalid': error.description }"/>
                  <div v-if="error.description" class="invalid-feedback">{{ errorText.description }}</div>
                </div>
              </div>
              <div class="form-group row">
                <label for="input_preconditions" class="col-md-2 col-form-label">PRECONDITIONS</label>
                <div class="col-md-10">
                  <input class="form-control" type="text" id="input_preconditions"
                    v-model="preconditions" placeholder="Preconditions" :class="{'is-invalid': error.preconditions }"/>
                  <div v-if="error.preconditions" class="invalid-feedback">{{ errorText.preconditions }}</div>
                </div>
              </div>
              <button class="btn btn-primary mr-2" @click="updateCourse">{{editing?'Update':'Add course'}}</button>
              <button class="btn btn-secondary" @click="closeUpdate">Cancel</button>
            </div>
          </div>
          <div v-else>
            <div v-if="current">
              <h3>{{current.name}}</h3>
              <p>{{current.description}}</p>
              <p><strong>Preconditions:</strong> {{current.preconditions}}</p>
              <div v-if="isAdmin" class="mt-3">
                <button class="btn btn-primary mr-2" @click="editCourse">Edit course</button>
                <button class="btn btn-primary" @click="removeCourse">Remove course</button>
              </div>
            </div>
          </div>
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
  name: 'CoursesPage',

  data() {
    return {
      //isAdmin: false,
      isAdmin: true,

      courses: [],
      current: null,

      name: '',
      description: '',
      preconditions: '',

      editing: false,
      addingNew: false,

      was_validated: false,
      error:{
        name: false,
        description: false,
        preconditions: false,
      },
      errorText:{
        name: '',
        description: '',
        preconditions: '',
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
    this.loadCourses()
  },

  methods: {
    async loadCourses() {
      try{
        var response = await axios.get(Config.SERVER_API + "courses")
        console.log(response.data.length)
        this.courses = response.data

        this.reloadCurrent()
        console.log('load courses')
        console.log(this.courses)
      }catch(error){
        console.log(error)
      }
    },

    selectCourse(id) {
      this.current = this.courses[id]
      this.closeUpdate()
    },

    addCourse() {
      this.addingNew = true
    },

    async removeCourse() {
      try{
        var course = {_id: this.current._id}
        await axios.post(Config.SERVER_API + 'remove_course', course)
        this.showSuccess('Removed')
        this.loadCourses()
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    editCourse() {
      this.editing = true
      this.fillForm()
    },

    fillForm() {
      this.name = this.current.name
      this.description = this.current.description
      this.preconditions = this.current.preconditions
    },

    reloadCurrent() {
      if(!this.current) return
      this.current = this.courses.find( (s)=>{ return s._id === this.current._id } )
    },

    async updateCourse() {
      try{

        if(this.addingNew){
          var course = {
            name: this.name,
            description: this.description,
          }

          await axios.post(Config.SERVER_API + 'add_course', course)
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
                description: this.description,
              }
            }
          }
          console.log(data)

          await axios.post(Config.SERVER_API + 'update_course', data)
          this.showSuccess('Course updated')
          this.editing = false
        }
        await this.loadCourses()
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }
    },

    closeUpdate() {
      this.editing = false
      this.addingNew = false
    },

    changeLogin() {
      if( this.$store.state.auth.logged) {
        if( this.$store.state.auth.role === 'admin' ){
          this.isAdmin = true
          console.log('Logged in as admin')
        } else {
          this.isAdmin = false
          console.log('Logged in as ' + this.$store.state.auth.role)
        }
      } else {
        this.isAdmin = false
      }
    },
  },
}

</script>
