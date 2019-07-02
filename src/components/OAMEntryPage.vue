<template>
  <div>
    <HeaderEFTG portal="OAM Portal" :showAuth="true" ref="headerEFTG" v-on:login="onLogin" v-on:logout="clear"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">European Financial Transparency Gateway</h2>                            
      <h3 class="text-center mb-5">OAM Data Entry Portal</h3>
      <div id="eftg-form" novalidate>      
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label for="input_issuer_name" class="col-md-5 col-form-label">ISSUER NAME</label>
              <div class="col-md-7">
                <input class="form-control" type="text" id="input_issuer_name" 
                       v-model="issuer_name" placeholder="Company" :class="{'is-invalid': error.issuer_name }"/>
                <div v-if="error.issuer_name" class="invalid-feedback">{{ errorText.issuer_name }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="input_home_member_state" class="col-md-5 col-form-label">ISSUER's HOME MEMBER STATE (HMS)</label>
              <div class="col-md-7">
                <select class="form-control" id="input_home_member_state" v-model="home_member_state" :class="{'is-invalid': error.home_member_state }">
                  <option disabled value="">Please select one</option>
                  <option
                    v-for="option in dictionary.homeMemberStates"
                    v-bind:key="option.code"
                    v-bind:value="option.code"
                  >
                    {{ option.code }} - {{ option.country }}
                  </option>
                </select>
                <div v-if="error.home_member_state" class="invalid-feedback">{{ errorText.home_member_state }}</div>
              </div>
            </div>
            <div class="form-group row">
              <!-- TODO: Take identifiers from dictionary -->
              <label for="input_identifier_value" class="col-md-5 col-form-label">LEGAL IDENTIFIER</label>
              <div class="col-md-7">
                <div class="btn-group btn-group-toggle" data-toggle="buttons">
                  <label class="btn btn-secondary" :class="{active: identifier_type==='LEI'}">
                    <input type="radio" id="LEI" v-model="identifier_type" value="LEI" autocomplete="off" checked> LEI
                  </label>
                  <label class="btn btn-secondary" :class="{active: identifier_type==='ISIN'}">
                    <input type="radio" id="ISIN" v-model="identifier_type" value="ISIN" autocomplete="off"> ISIN
                  </label>
                  <label class="btn btn-secondary" :class="{active: identifier_type==='VAT'}">
                    <input type="radio" id="VAT" v-model="identifier_type" value="VAT" autocomplete="off"> VAT
                  </label>
                  <label class="btn btn-secondary" :class="{active: identifier_type==='RegistrationNumber'}">
                    <input type="radio" id="REG" v-model="identifier_type" value="RegistrationNumber" autocomplete="off"> REG
                  </label>
                </div>
                <input type="text" id="input_identifier_value" 
                       v-model="identifier_value" placeholder="Please enter a valid value" 
                       class="form-control"
                       :class="{'is-invalid': error.identifier_value }"
                />
                <div v-if="error.identifier_value" class="invalid-feedback">{{ errorText.identifier_value }}</div>
              </div>
            </div>
            <div class="form-group row" id="formClass">
              <label for="input_subclass" class="col-md-5 col-form-label">DOCUMENT CLASS AND SUBCLASS</label>
              <div class="col-md-7">
                <select class="form-control" id="input_subclass" v-model="subclass" :class="{'is-invalid': error.subclass }">
                  <option disabled value="">Please select one</option>
                  <option
                    v-for="option in dictionary.docClassSubclass"
                    v-bind:key="option.id"
                    v-bind:value="option.id"
                    v-bind:disabled="option.type === 'class'"
                  >
                    {{ option.number + ' ' + option.name }}
                  </option>
                </select>
                <div v-if="error.subclass" class="invalid-feedback">{{ errorText.subclass }}</div>
              </div>
            </div>
            <div v-if="showFinancialYear" class="form-group row">
              <label for="input_financial_year" class="col-md-5 col-form-label">DOCUMENT FINANCIAL YEAR</label>
              <div class="col-md-7">
                <input type="text" id="input_financial_year" v-model="financial_year" placeholder="" class="form-control" :class="{'is-invalid': error.financial_year }"/>
                <div v-if="error.financial_year" class="invalid-feedback">{{ errorText.financial_year }}</div>
              </div>
            </div>                        
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label for="input_disclosure_date" class="col-md-5 col-form-label">DOCUMENT DISCLOSURE DATE*</label>
              <div class="col-md-7">
                <input type="text" id="input_disclosure_date" 
                   v-model="disclosure_date" placeholder="dd/mm/yyyy"
                   class="form-control" 
                   :class="{'is-invalid': error.disclosure_date }"
                />    
                <div v-if="error.disclosure_date" class="invalid-feedback">{{ errorText.disclosure_date }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="input_document_language" class="col-md-5 col-form-label">DOCUMENT LANGUAGE</label>
              <div class="col-md-7">
                <select class="form-control" id="input_document_language" v-model="document_language" :class="{'is-invalid': error.document_language }">
                  <option disabled value="">Please select one</option>
                  <option
                    v-for="(option, code) in dictionary.languages"
                    v-bind:key="code"
                    v-bind:value="code"
                  >
                    {{ option.name }}
                  </option>
                </select>
                <div v-if="error.document_language" class="invalid-feedback">{{ errorText.document_language }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="input_title" class="col-md-5 col-form-label">DOCUMENT TITLE</label>
              <div class="col-md-7">
                <input type="text" id="input_title" v-model="title" placeholder="Please add a document title" class="form-control" :class="{'is-invalid': error.title }"/>    
                <div v-if="error.title" class="invalid-feedback">{{ errorText.title }}</div>
              </div>
            </div>            
            <div class="form-group row">
              <label for="input_submission_date" class="col-md-5 col-form-label">DOCUMENT SUBMISSION DATE**</label>
              <div class="col-md-7">
                <input type="text" id="input_submission_date" 
                   v-model="submission_date" placeholder="dd/mm/yyyy"
                   class="form-control" 
                   :class="{'is-invalid': error.submission_date }"
                />    
                <div v-if="error.submission_date" class="invalid-feedback">{{ errorText.submission_date }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="input_type_submission" class="col-md-5 col-form-label">DOCUMENT STATUS</label>
              <div class="col-md-7">
                <label class="radio-inline form-check-label mr-4">
                  <input type="radio" value="first" v-model="type_submission" class="mr-1" checked
                  >First submission
                </label>
                <label class="radio-inline form-check-label">
                  <input type="radio" value="revised" v-model="type_submission" class="mr-1">
                  Revised submission
                </label>
              </div>
            </div>
            <div class="row">
              <label class="col-form-label col-12"
                >*The disclosure date corresponds to the official date of document release as set by the Issuer.
              </label>
              <label class="col-form-label col-12"
                >**The submission date corresponds to the date at which the issuer gives the information to the OAM.
              </label>
            </div>                              
          </div>
        </div>
        <div class="row">          
          <div class="col-md-6">
            <div class="custom-file">            
              <input type="file" class="custom-file-input" id="input_file" @change="validateFile" :class="{'is-invalid': error.file }">
              <label class="custom-file-label" for="input_file">Choose file...</label>
              <div v-if="error.file" class="invalid-feedback">{{ errorText.file }}</div>          
            </div>
          </div>
        </div>
        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button v-on:click="submit" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Submit</button>
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
import Crypto from 'crypto'
import { Client } from 'eftg-dsteem'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import Validate from '@/js/validate.js'
import Dictionary from '@/mixins/Dictionary.js'
import SteemClient from '@/mixins/SteemClient.js'
import HeaderEFTG from '@/components/HeaderEFTG'

export default {
  name: 'OAMEntryPage',
  
  data() {
    return {
      issuer_name: "",
      home_member_state: "",
      identifier_type: "LEI",
      identifier_value: "",
      subclass: "",
      subclassTag: "",
      disclosure_date: "",
      submission_date: "",
      document_language: "",
      title: "",
      financial_year: "",
      type_submission: 'first',
      showFinancialYear: false,
      
      lastPermlink: '',
      
      sending: false,      
      error: {
        issuer_name: false,
        home_member_state: false,
        identifier_type: false,
        identifier_value: false,
        subclass: false,
        disclosure_date: false,
        submission_date: false,
        document_language: false,
        title: false,
        financial_year: false,
        file: false
      },
      errorText: {
        issuer_name: "No error",
        home_member_state: "No error",
        identifier_type: "No error",
        identifier_value: "No error",
        subclass: "No error",
        disclosure_date: "No error",
        submission_date: "No error",
        document_language: "No error",
        title: "No error",
        financial_year: "No error",
        file: "No error"
      }
    };
  },
  
  components: {
    HeaderEFTG
  },
  
  mixins: [
    Dictionary,
    SteemClient
  ],
  
  created() {
    //validate fields while typing
    this.debounced_validateIssuerName       = debounce(this.validateIssuerName      , 300)
    this.debounced_validateHomeMemberState  = debounce(this.validateHomeMemberState , 300)
    this.debounced_validateIdentifierType   = debounce(this.validateIdentifierType  , 300)
    this.debounced_validateIdentifierValue  = debounce(this.validateIdentifierValue , 300)
    this.debounced_validateSubclass         = debounce(this.validateSubclass        , 300)
    this.debounced_validateDisclosureDate   = debounce(this.validateDisclosureDate  , 300)
    this.debounced_validateSubmissionDate   = debounce(this.validateSubmissionDate  , 300)
    this.debounced_validateDocumentLanguage = debounce(this.validateDocumentLanguage, 300)
    this.debounced_validateTitle            = debounce(this.validateTitle           , 300)
    this.debounced_validateFinancialYear    = debounce(this.validateFinancialYear   , 300)
    this.debounced_validateField            = debounce(this.validateField           , 300)
  },
  mounted() {
    this.startEventListenerFile();
    
    var d = new Date()
    this.disclosure_date = Utils.datetoddmmyyyy(d)
    this.submission_date = Utils.datetoddmmyyyy(d)
    this.financial_year = (d.getFullYear()-1) + ''
    this.document_language = 'en'
  },
  watch: {
    issuer_name: function() {
      this.debounced_validateIssuerName();
    },
    home_member_state: function() {
      this.debounced_validateHomeMemberState();
    },
    identifier_type: function() {
      this.debounced_validateIdentifierType();
      this.debounced_validateIdentifierValue();
    },
    identifier_value: function() {
      this.debounced_validateIdentifierValue();
    },
    subclass: function(newVal) {
      this.debounced_validateSubclass();
      if(newVal >= 100 && newVal < 200){
        this.showFinancialYear = true;        
      } else {
        this.showFinancialYear = false;
      }
      
      this.subclassTag = this.dictionary.docClassTags[newVal+""];
      
      this.debounced_validateFinancialYear()
      this.debounced_validateDisclosureDate()
      this.debounced_validateSubmissionDate()               
    },
    disclosure_date: function() {
      this.debounced_validateFinancialYear()
      this.debounced_validateDisclosureDate()
      this.debounced_validateSubmissionDate()
    },
    submission_date: function() {
      this.debounced_validateFinancialYear()
      this.debounced_validateDisclosureDate()
      this.debounced_validateSubmissionDate()
    },
    document_language: function() {
      this.debounced_validateDocumentLanguage();
    },
    title: function() {
      this.debounced_validateTitle();
    },
    financial_year: function() {
      this.debounced_validateFinancialYear()
      this.debounced_validateDisclosureDate()
      this.debounced_validateSubmissionDate()
    }
  },
  methods: {
    submit() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()
      
      let self = this;
      
      //Principal function to submit the file and data
      async function submit_async() {
        self.RPCnode_setMaxFails(1)
        self.RPCnode_setMaxFailRounds(2)

        //Validation of data
        var valid = true;
        valid = self.validateIssuerName(true) && valid;
        valid = self.validateHomeMemberState(true) && valid;
        valid = self.validateIdentifierType(true) && valid;
        valid = self.validateIdentifierValue(true) && valid;
        valid = self.validateSubclass(true) && valid;
        valid = self.validateDisclosureDate(true) && valid;
        valid = self.validateSubmissionDate(true) && valid;
        //valid = self.validateStorageDate(true) && valid
        valid = self.validateDocumentLanguage(true) && valid;
        valid = self.validateTitle(true) && valid;        
        valid = self.validateFile(true) && valid;
        //valid = self.validateTypeSubmission(true) && valid
        
        // Validate year in case subclass Annual or half-year Financial Report 
        if(self.subclass >= 100 && self.subclass < 200){         
          valid = self.validateFinancialYear(true) && valid;
          var financial_year = parseInt(self.financial_year)
        }else{
          self.financial_year = '';
          var financial_year = 0
        }

        var form = document.getElementById('eftg-form');
        form.classList.add('was-validated');
        
        if (!valid) {
          throw new Error("Error validating fields!");
        }

        // User credentials
        if (!self.$store.state.auth.logged) {
          self.$refs.headerEFTG.login();
          //todo: make that after login it submits the post automatically
          throw new Error('Please login');
        }
        var username = self.$store.state.auth.user;
        var privKey = self.$store.state.auth.keys.posting;

        // Creation of the new post in the blockchain
        var discDate = "";
        var submDate = ''
        try {
          discDate = Utils.dateToString(
            Utils.ddmmyyyytoDate(self.disclosure_date)
          );
        } catch (e) {
          discDate = "";
        }
        
        try {
          submDate = Utils.dateToString(
            Utils.ddmmyyyytoDate(self.submission_date)
          );
        } catch (e) {
          submDate = '';
        }

        // TODO: addRandom starts false and we check if the post exists using dsteem 
        var addRandom = true;
        
        while (true) {
          var permlink = Utils.createPermLink(self.title, addRandom);
          //var urlPost = "oam/@" + username + "/" + permlink;
          //var post = await self.client.database.getState(urlPost);
          //console.log(post);
          //TODO: if the post exists, then addRandom=true and continue the while loop, else break
          break;
        }

        var identifier = self.dictionary.identifiers.find( (ide)=>{return ide.type === self.identifier_type} )

        var json_metadata = {
          issuer_name: self.issuer_name,
          home_member_state: self.home_member_state,
          identifier_id: identifier.id,
          identifier_value: self.identifier_value,
          subclass: self.subclass,
          disclosure_date: discDate,
          submission_date: submDate,
          document_language: self.document_language,
          comment: self.title,
          financial_year: financial_year,
          type_submission: self.type_submission,
          tags: [
            self.subclassTag,
            self.issuer_name,
            self.home_member_state,
            self.identifier_value
          ],
          storage_date: Utils.dateToString(new Date()),
          permlink: permlink,
          app:Config.APP_VERSION
        };
        
        if(self.lastPermlink !== '') {
          try {          
            var previous_post = await self.steem_database_call('get_content',[username,self.lastPermlink])
            var previous_json_metadata = JSON.parse(previous_post.json_metadata)
            var same_post = true
            for(var key in json_metadata){
              if(key==='storage_date' || key==='tags' || key==='permlink') continue
              
              if(json_metadata[key] !== previous_json_metadata[key]){
                same_post = false
                break
              }
            }
            
            if(same_post) {
              throw new Error('This document was already submitted.')
            }
          } catch (error) {
            console.log('It was not possible to load the previous post: ')
            throw error
          }
        }
        
        // read file, calculation of the hash, and signature with privkey
        // (format used in ImageHoster for uploading)
        self.showInfo('Reading file...')
        var localFile = document.getElementById("input_file").files[0];
        var fileData = await self.readFileAsBuffer(localFile,{
          onProgress: function(progressEvent){
            var loaded = progressEvent.loaded
            var total = progressEvent.total
            self.showInfo('Reading file '+Math.floor(loaded*100/total)+'%')            
          }
        });
        const imageHash = Crypto.createHash("sha256")
          .update("ImageSigningChallenge")
          .update(fileData)
          .digest();
        const signature = privKey.sign(imageHash).toString();
        
        // Uploading the file

        var formFile = new FormData();
        formFile.append("pdf", localFile);
        var urlWithSignature =
          Config.CDN + username + '/' + signature;

        // TODO: try - catch to check if the file size is too long and there is an error
        
        
        //var response = await axios.post(urlWithSignature, formFile);
        var response = await axios({
          method: 'post',
          url: urlWithSignature,
          data: formFile,
          responseType: 'json',
          responseEncoding: 'utf8',
          onUploadProgress: function (progressEvent) {
            var loaded = progressEvent.loaded
            var total = progressEvent.total
            self.showInfo('Uploading file '+Math.floor(loaded*100/total)+'%')                        
          },          
        })
        
        var pdfUrl = response.data.url
        console.log('Document uploaded to CDN')
        console.log(response.data.url)
        
        var body = "[[pdf link]](" + pdfUrl + ")";

        var post = {
          author: username,
          body: body,
          json_metadata: JSON.stringify(json_metadata),
          parent_author: "",
          parent_permlink: "oam",
          permlink: permlink,
          title: self.title
        };

        self.showInfo('Sending to the blockchain...')

        //var result = await self.client.broadcast.comment(post, privKey);
        var result = await self.steem_broadcast_comment(post, privKey)
        
        self.showSuccess('Document published! <a href="'+Config.EXPLORER+'@'+username+'/'+permlink+'" class="alert-link" target="_blank">@'+username+'/'+permlink+'</a>');
        self.lastPermlink = permlink;
        
        console.log('Document publised in the blockchain!');
        console.log(result);
      }
      
      submit_async()
      .then(function(){
        self.sending = false
        self.hideInfo()
        
        self.clearFile()
        document.getElementById('eftg-form').classList.remove('was-validated')
      })      
      .catch(function(error, response){      
        self.sending = false
        self.hideInfo()
        
        console.log(error);
        //self.showAlert(false,error.message);
        self.showDanger(error.message)              
      });
    },

    abort() {
      this.abortNodeConnection = true
      if(this.sending) this.aborting = true
    },
    
    onLogin() {
      var username = this.$store.state.auth.user
      if(username.length < 3) return
      username = username.substring(0,3)
      var hms = this.dictionary.homeMemberStates.find(function (hms) {return hms.code3.toLowerCase() === username})
      if(hms && this.home_member_state === '') {
        this.home_member_state = hms.code 
      }
    },
    
    clear() {
      var d = new Date()
      this.disclosure_date = Utils.datetoddmmyyyy(d)
      this.submission_date = Utils.datetoddmmyyyy(d)
      this.financial_year = (d.getFullYear()-1) + ''
      this.document_language = 'en'
    
      this.issuer_name = "";
      this.home_member_state = "";
      this.identifier_type = "LEI";
      this.identifier_value = "";
      this.subclass = "";
      this.title = "";
      this.clearFile()
      
      this.clearErrors()
      document.getElementById('eftg-form').classList.remove('was-validated');
      
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()     
    },
    
    clearErrors() {
      for(var key in this.error) this.error[key] = false
      for(var key in this.errorText) this.errorText[key] = 'No error'
    },

    clearFile() {
      //document.getElementById("input_file").labels[0].childNodes[0].data = 'Choose file...'
      document.getElementById('input_file').nextElementSibling.innerHTML = 'Choose file...'
      document.getElementById('input_file').setAttribute('type','')
      document.getElementById('input_file').setAttribute('type','file')
    },

    startEventListenerFile() {
      var input = document.getElementById("input_file");
      var label = input.nextElementSibling,
        labelVal = label.innerHTML;

      input.addEventListener("change", function(e) {
        var fileName = e.target.value.split("\\").pop();
        if (fileName) label.innerHTML = fileName;
        else label.innerHTML = labelVal;
      });
    },

    //Definition of the function to read a file using Promises (better for using await)
    //More info: https://blog.shovonhasan.com/using-promises-with-filereader/
    async readFileAsBuffer(inputFile, config) {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject(new DOMException("Problem parsing file to upload"));
        };

        reader.onload = () => {
          if(config.onLoad) config.onLoad()
        
          //the result is an ArrayBuffer, we change it to Buffer.
          //this is important because the hash using 'crypto' is different in the 2 cases

          //TODO: [es-lint] says that Buffer is not defined, however it works
          var dataArrayBuffer = reader.result;
          var dataBuffer = new Buffer(dataArrayBuffer);
          resolve(dataBuffer);
        };
        
        if(config.onProgress)  reader.onprogress  = config.onProgress
        if(config.onAbort)     reader.onabort     = config.onAbort
        if(config.onError)     reader.onerror     = config.onError
        if(config.onLoadStart) reader.onloadstart = config.onLoadStart
        if(config.onLoadEnd)   reader.onloadend   = config.onLoadEnd 
        
        reader.readAsArrayBuffer(inputFile);
      });
    },
    
    loadJSON(variable, url){
      let self = this;
      axios.get(url).then(function(result){
        console.log("Response for "+variable);
        console.log(result);
        self[variable] = result.data;
      }).catch(function(error){
        console.log("Error with axios "+variable);
        console.log(error);
      });
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

    //validation
    validateIssuerName(submit) {
      let self = this
      return this.validateField('issuer_name', submit, function(){
        Validate.validateIssuerName(self.issuer_name)
      } )            
    },

    validateHomeMemberState(submit) {
      let self = this
      return this.validateField('home_member_state', submit, function(){
        Validate.validateHomeMemberState(self.home_member_state, self.dictionary.homeMemberStates)
      } )
    },

    validateIdentifierType(submit) {
      return true
      /*let self = this
      return this.validateField('identifier_type', submit, function(){
        Validate.validateIdentifierType(self.identifier_type, self.dictionary.identifiers)
      } )*/
    },

    validateIdentifierValue(submit) {      
      let self = this
      return this.validateField('identifier_value', submit, function(){
        Validate.validateIdentifierValue(self.identifier_value, self.identifier_type, self.dictionary.identifiers, self.dictionary.homeMemberStates)
      } )
    },

    validateSubclass(submit) {
      let self = this
      return this.validateField('subclass', submit, function(){
        Validate.validateSubclass(self.subclass, self.dictionary.docClasses)
      } )
    },

    validateDisclosureDate(submit) {
      let self = this
      return this.validateField('disclosure_date', submit, function(){
        var disclosure_date = Utils.ddmmyyyytoDate(self.disclosure_date).toISOString().slice(0, -5)
        var submission_date = ''
        var financial_year = parseInt(self.financial_year)
        try{ submission_date = Utils.ddmmyyyytoDate(self.submission_date).toISOString().slice(0, -5) } catch(e) {}
        if(self.showFinancialYear)       
          Validate.validateDisclosureDate(disclosure_date, submission_date, financial_year)
        else
          Validate.validateDisclosureDate(disclosure_date, submission_date)
      } )
    },
    
    validateSubmissionDate(submit) {
      let self = this
      return this.validateField('submission_date', submit, function(){
        var submission_date = Utils.ddmmyyyytoDate(self.submission_date).toISOString().slice(0, -5)
        var disclosure_date = ''
        try{ disclosure_date = Utils.ddmmyyyytoDate(self.disclosure_date).toISOString().slice(0, -5) } catch(e) {}
        Validate.validateSubmissionDate(submission_date, disclosure_date)
      } )
    },

    validateDocumentLanguage(submit) {
      let self = this
      return this.validateField('document_language', submit, function(){
        Validate.validateDocumentLanguage(self.document_language, self.dictionary.languages)
      } )
    },

    validateTitle(submit) {
      let self = this
      return this.validateField('title', submit, function(){
        Validate.validateTitle(self.title)
      } )
    },

    validateFinancialYear(submit) {
      if(!this.showFinancialYear) return true;
      let self = this
      return this.validateField('financial_year', submit, function(){
        var disclosure_date = ''
        var financial_year = parseInt(self.financial_year)
        if (self.financial_year !== String(financial_year))
          throw new Error('Incorrect year')
        try{ disclosure_date = Utils.ddmmyyyytoDate(self.disclosure_date).toISOString().slice(0, -5) } catch(e) {}
        Validate.validateFinancialYear(financial_year, disclosure_date)
      } )
    },

    validateFile(submit) {
      if (submit && document.getElementById('input_file').files.length === 0) {
        this.showInvalid('file', 'Please select a file')
        return false
      }
      
      var f = document.getElementById('input_file').files[0]
      /*
       * f.lastModified: 1540809732971
       * f.lastModifiedDate: Mon Oct 29 2018 11:42:12 GMT+0100 (Central European Standard Time) {}
       * f.name: "2017-Annual Report Groep N.V..pdf"
       * f.size: 9981843
       * f.type: "application/pdf"
       * f.webkitRelativePath: ""
       */
      
      if(f.size > this.serverConfig.maximum_file_size) {
        this.showInvalid('file', 'Maximum upload file size: '+Utils.prettyFileSize(this.serverConfig.maximum_file_size))
        return false                
      }
      this.hideInvalid('file')
      return true;
    }
  }
};
</script>

<style scoped>

#formClass select option:disabled {  
  font-weight: bold;
  color: black;
}

</style>
