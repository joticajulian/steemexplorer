<template>
  <div>
    <HeaderEFTG portal="OAM Portal" :showAuth="true" ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center">European Financial Transparency Gateway</h2>                            
      <h3 class="text-center mb-5">OAM Data Entry Portal</h3>
      <div id="eftg-form" novalidate>      
        <div class="row">
          <div class="col-md-6">
            <div class="form-group row">
              <label for="inputIssuerName" class="col-md-5 col-form-label">ISSUER NAME</label>
              <div class="col-md-7">
                <input class="form-control" type="text" id="inputIssuerName" 
                       v-model="issuer_name" placeholder="Company" :class="{'is-invalid': error.issuer_name }"/>
                <div v-if="error.issuer_name" class="invalid-feedback">{{ errorText.issuer_name }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputHomeMemberState" class="col-md-5 col-form-label">ISSUER's HOME MEMBER STATE (HMS)</label>
              <div class="col-md-7">
                <select class="form-control" id="inputHomeMemberState" v-model="home_member_state" :class="{'is-invalid': error.home_member_state }">
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
              <label for="inputLegalIdentifier" class="col-md-5 col-form-label">LEGAL IDENTIFIER</label>
              <div class="col-md-7">
                <div class="btn-group btn-group-toggle" data-toggle="buttons">
                  <label class="btn btn-secondary" :class="{active: identifier_id==='1'}">
                    <input type="radio" id="LEI" v-model="identifier_id" value="1" autocomplete="off" checked> LEI
                  </label>
                  <label class="btn btn-secondary" :class="{active: identifier_id==='4'}">
                    <input type="radio" id="ISIN" v-model="identifier_id" value="4" autocomplete="off"> ISIN
                  </label>
                  <label class="btn btn-secondary" :class="{active: identifier_id==='2'}">
                    <input type="radio" id="VAT" v-model="identifier_id" value="2" autocomplete="off"> VAT
                  </label>
                  <label class="btn btn-secondary" :class="{active: identifier_id==='3'}">
                    <input type="radio" id="REG" v-model="identifier_id" value="3" autocomplete="off"> REG
                  </label>
                </div>
                <input type="text" id="inputLegalIdentifier" 
                       v-model="identifier_value" placeholder="Please enter a valid value" 
                       class="form-control"
                       :class="{'is-invalid': error.identifier_value }"
                />
                <div v-if="error.identifier_value" class="invalid-feedback">{{ errorText.identifier_value }}</div>
              </div>
            </div>
            <div class="form-group row" id="formClass">
              <label for="inputClass" class="col-md-5 col-form-label">DOCUMENT CLASS AND SUBCLASS</label>
              <div class="col-md-7">
                <select class="form-control" id="inputClass" v-model="subclass" :class="{'is-invalid': error.subclass }">
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
              <label for="inputFinancialYear" class="col-md-5 col-form-label">DOCUMENT FINANCIAL YEAR</label>
              <div class="col-md-7">
                <input type="text" id="inputFinancialYear" v-model="financial_year" placeholder="" class="form-control" :class="{'is-invalid': error.financial_year }"/>
                <div v-if="error.financial_year" class="invalid-feedback">{{ errorText.financial_year }}</div>
              </div>
            </div>                        
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label for="inputDocumentDisclosureDate" class="col-md-5 col-form-label">DOCUMENT DISCLOSURE DATE*</label>
              <div class="col-md-7">
                <input type="text" id="inputDocumentDisclosureDate" 
                   v-model="disclosure_date" placeholder="dd/mm/yyyy"
                   class="form-control" 
                   :class="{'is-invalid': error.disclosure_date }"
                />    
                <div v-if="error.disclosure_date" class="invalid-feedback">{{ errorText.disclosure_date }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputDocumentLanguage" class="col-md-5 col-form-label">DOCUMENT LANGUAGE</label>
              <div class="col-md-7">
                <select class="form-control" id="inputDocumentLanguage" v-model="document_language" :class="{'is-invalid': error.document_language }">
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
              <label for="inputComment" class="col-md-5 col-form-label">DOCUMENT TITLE</label>
              <div class="col-md-7">
                <input type="text" id="inputComment" v-model="comment" placeholder="Please add a document title" class="form-control" :class="{'is-invalid': error.comment }"/>    
                <div v-if="error.comment" class="invalid-feedback">{{ errorText.comment }}</div>
              </div>
            </div>            
            <div class="form-group row">
              <label for="inputDocumentSubmissionDate" class="col-md-5 col-form-label">DOCUMENT SUBMISSION DATE**</label>
              <div class="col-md-7">
                <input type="text" id="inputDocumentSubmissionDate" 
                   v-model="submission_date" placeholder="dd/mm/yyyy"
                   class="form-control" 
                   :class="{'is-invalid': error.submission_date }"
                />    
                <div v-if="error.submission_date" class="invalid-feedback">{{ errorText.submission_date }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputDocumentStatus" class="col-md-5 col-form-label">DOCUMENT STATUS</label>
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
          <!--<div class="form-group col-md-6" id="formTypeSubmission">
            <label class="radio-inline form-check-label mr-4">
              <input type="radio" value="first" v-model="type_submission" class="mr-1" checked
              >First submission
            </label>
            <label class="radio-inline form-check-label">
              <input type="radio" value="revised" v-model="type_submission" class="mr-1">
              Revised submission
            </label>
          </div>-->          
        </div>
        <div class="row">          
          <div class="col-md-6">
          <div class="custom-file">            
            <input type="file" class="custom-file-input" id="inputFile" @change="validateFile" :class="{'is-invalid': error.file }">
            <label class="custom-file-label" for="inputFile">Choose file...</label>
            <div v-if="error.file" class="invalid-feedback">{{ errorText.file }}</div>          
          </div>
          </div>
        </div>
        <div class="row">
          <div class="form-group col-md-6 align-bottom" style="padding-top: 8px;">
            <button v-on:click="submit" class="btn btn-primary btn-large" :disabled="sending"><div v-if="sending" class="mini loader"></div>Submit</button>
            <button v-on:click="clear"  class="btn btn-secondary btn-large">Clear</button>
          </div>            
        </div>
        <div v-if="alert.info" class="alert alert-info" role="alert">{{alertText.info}}</div>
        <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alertText.success"></div>
        <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alertText.danger}}</div>
      </div>
    </div>    
  </div>
</template>

<script>
import debounce from "lodash.debounce";
import axios from "axios";
import Crypto from "crypto";
import { Client } from 'eftg-dsteem'

import Config from "@/config.js";
import Utils from "@/js/utils.js";
import Dictionary from "@/mixins/Dictionary.js";
import HeaderEFTG from "@/components/HeaderEFTG";
import FooterEFTG from "@/components/FooterEFTG";

export default {
  name: "OAMEntryPage",
  
  data() {
    return {
      client: null,
    
      issuer_name: "",
      home_member_state: "",
      identifier_id: "1",
      identifier_value: "",
      subclass: "",
      subclassTag: "",
      disclosure_date: "",
      submission_date: "",
      document_language: "",
      comment: "",
      financial_year: "",
      type_submission: 'first',
      showFinancialYear: false,
      
      sending: false,      
      error: {
        issuer_name: false,
        home_member_state: false,
        identifier_id: false,
        identifier_value: false,
        subclass: false,
        disclosure_date: false,
        submission_date: false,
        document_language: false,
        comment: false,
        financial_year: false,
        file: false
      },
      errorText: {
        issuer_name: "No error",
        home_member_state: "No error",
        identifier_id: "No error",
        identifier_value: "No error",
        subclass: "No error",
        disclosure_date: "No error",
        submission_date: "No error",
        document_language: "No error",
        comment: "No error",
        financial_year: "No error",
        file: "No error"
      },
      alert: {
        success: false,
        danger: false,
        info: false,
      },
      alertText: {
        success: '',
        danger: '',
        info: ''
      },
    };
  },
  
  components: {
    HeaderEFTG,
    FooterEFTG
  },
  
  mixins: [
    Dictionary
  ],
  
  created() {
    this.client = new Client(Config.RPC_NODE.url);
  
    //validate fields while typing
    this.debounced_validateIssuerName       = debounce(this.validateIssuerName      , 300);
    this.debounced_validateHomeMemberState  = debounce(this.validateHomeMemberState , 300);
    this.debounced_validateIdentifierId     = debounce(this.validateIdentifierId    , 300);
    this.debounced_validateIdentifierValue  = debounce(this.validateIdentifierValue , 300);
    this.debounced_validateSubclass         = debounce(this.validateSubclass        , 300);
    this.debounced_validateDisclosureDate   = debounce(this.validateDisclosureDate  , 300);
    this.debounced_validateSubmissionDate   = debounce(this.validateSubmissionDate  , 300);
    this.debounced_validateDocumentLanguage = debounce(this.validateDocumentLanguage, 300);
    this.debounced_validateComment          = debounce(this.validateComment         , 300);
    this.debounced_validateFinancialYear    = debounce(this.validateFinancialYear   , 300);  
  },
  mounted() {
    this.startEventListenerFile();
    
    var d = new Date()
    this.disclosure_date = Utils.datetoddmmyyyy(d)
    this.financial_year = d.getFullYear() + ''
  },
  watch: {
    issuer_name: function() {
      this.debounced_validateIssuerName();
    },
    home_member_state: function() {
      this.debounced_validateHomeMemberState();
    },
    identifier_id: function() {
      this.debounced_validateIdentifierId();
      this.debounced_validateIdentifierValue();
    },
    identifier_value: function() {
      this.debounced_validateIdentifierValue();
    },
    subclass: function(newVal) {
      this.debounced_validateSubclass();
      if(newVal == 101 || newVal == 102) this.showFinancialYear = true;
      else this.showFinancialYear = false;
      
      this.subclassTag = this.dictionary.docClassTags[newVal+""];               
    },
    disclosure_date: function() {
      this.debounced_validateDisclosureDate();
    },
    submission_date: function() {
      this.debounced_validateSubmissionDate();
    },
    document_language: function() {
      this.debounced_validateDocumentLanguage();
    },
    comment: function() {
      this.debounced_validateComment();
    },
    financial_year: function() {
      this.debounced_validateFinancialYear();
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
        //Validation of data
        var valid = true;
        valid = self.validateIssuerName(true) && valid;
        valid = self.validateHomeMemberState(true) && valid;
        valid = self.validateIdentifierId(true) && valid;
        valid = self.validateIdentifierValue(true) && valid;
        valid = self.validateSubclass(true) && valid;
        valid = self.validateDisclosureDate(true) && valid;
        valid = self.validateSubmissionDate(true) && valid;
        valid = self.validateDocumentLanguage(true) && valid;
        valid = self.validateComment(true) && valid;        
        valid = self.validateFile(true) && valid;
        
        // Validate year in case subclass Annual or half-year Financial Report 
        if(self.subclass == 101 || self.subclass == 102){         
          valid = self.validateFinancialYear(true) && valid;
        }else{
          self.financial_year = '';
        }

        var form = document.getElementById('eftg-form');
        form.classList.add('was-validated');
        
        if (!valid) {
          console.log("Error validating fields!");
          
          self.showAlert(false,"Error validating fields!");
          
          return false;
        }

        // User credentials
        if (!self.$store.state.auth.logged) {
          self.$refs.headerEFTG.login();
          //todo: make that after login it submits the post automatically
          return;
        }
        var username = self.$store.state.auth.user;
        var privKey = self.$store.state.auth.keys.posting;

        // read file, calculation of the hash, and signature with privkey
        // (format used in ImageHoster for uploading)
        self.showInfo('Reading file...')
        var localFile = document.getElementById("inputFile").files[0];
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
        console.log("signature:" + signature);

        // Uploading the file

        var formFile = new FormData();
        formFile.append("pdf", localFile);
        var urlWithSignature =
          Config.IMAGE_HOSTER.url + "/" + username + "/" + signature;

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
        
        var pdfUrl = response.data.url;

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
          var permlink = Utils.createPermLink(self.comment, addRandom);
          var urlPost = "oam/@" + username + "/" + permlink;
          var post = await self.client.database.getState(urlPost);
          console.log(post);
          //TODO: fix dsteem response problem... if the post exists, then addRandom=true and continue the while loop, else break
          break;
        }
        
        var body = "[[pdf link]](" + pdfUrl + ")";

        var json_metadata = {
          issuer_name: self.issuer_name,
          home_member_state: self.home_member_state,
          identifier_id: parseInt(self.identifier_id),
          identifier_value: self.identifier_value,
          subclass: self.subclass,
          disclosure_date: discDate,
          submission_date: submDate,
          document_language: self.document_language,
          comment: self.comment,
          financial_year: self.financial_year,
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

        var post = {
          author: username,
          body: body,
          json_metadata: JSON.stringify(json_metadata),
          parent_author: "",
          parent_permlink: "oam",
          permlink: permlink,
          title: self.comment
        };

        console.log("post");
        console.log(post);
        
        // new Date(Date.now() + expireTime).toISOString().slice(0, -5),
        /*var head_block_number = 2854535; 
        var head_block_id = "002b8e87b878c726a2f4c21a799d35cd576e890c"     
        var prefix = Buffer.from(head_block_id, 'hex')
        var prefix2 = prefix.readUInt32LE(4);
          
        var op = {
            "ref_block_num": head_block_number,
            "ref_block_prefix": prefix2,
            "expiration": "2018-12-19T19:20:15",
            "operations": [["comment", post ]],
            "extensions": []            
          };
          
        var signed_transaction = self.client.broadcast.sign(op , privKey);
        
        var params = [signed_transaction];*/ 
        
        self.showInfo('Sending to the blockchain...')
        
        //var result = await self.client.broadcast.call("broadcast_transaction_synchronous", params);                              
        //var result = await self.client.broadcast.send(signed_transaction);
        var result = await self.client.broadcast.comment(post, privKey);
        
        self.showAlert(true,'Document published! <a href="/#/explorer/@'+username+'/'+permlink+'" class="alert-link" target="_blank">@'+username+'/'+permlink+'</a>');        
        console.log("document publised!");
        console.log(result);
      }
      
      submit_async()
      .then(function(){
        self.sending = false
        self.hideInfo()
      })      
      .catch(function(error, response){      
        console.log(error);
        self.showAlert(false,error.message);
        self.sending = false
        self.hideInfo()      
      });
    },
    
    clear() {
      this.issuer_name = "";
      this.home_member_state = "";
      this.identifier_id = "1";
      this.identifier_value = "";
      this.subclass = "";
      this.disclosure_date = "";
      this.submission_date = "";
      this.document_language = "";
      this.comment = "";
      this.financial_year = "";
      document.getElementById("inputFile").labels[0].childNodes[0].data = 'Choose file...'
      document.getElementById('inputFile').setAttribute('type','')
      document.getElementById('inputFile').setAttribute('type','file')
      
      this.hideSuccess()
      this.hideDanger()
      this.hideInfo()     
    },

    startEventListenerFile() {
      var input = document.getElementById("inputFile");
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
    
    showAlert(success, message){
      if(success) {
        this.alert.success = true;
        this.alertText.success = message;
        
        this.alert.danger = false;
        this.alertText.danger = '';
      }else{
        this.alert.success = false;
        this.alertText.success = '';
        
        this.alert.danger = true;
        this.alertText.danger = message;
      }
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
    
    //validation
    validateIssuerName(submit) {
      if (submit && this.issuer_name === "") {
        this.error.issuer_name = true;
        this.errorText.issuer_name = "Issuer name is empty";
        document.getElementById('inputIssuerName').setCustomValidity("invalid");
        return false;
      }
      if (this.issuer_name.length > 200) {
        this.error.issuer_name = true;
        this.errorText.issuer_name = "The issuer name is too long";
        document.getElementById('inputIssuerName').setCustomValidity("invalid");
        return false;
      }
      this.error.issuer_name = false;
      this.errorText.issuer_name = "No error";
      document.getElementById('inputIssuerName').setCustomValidity("");
      return true;
    },

    validateHomeMemberState(submit) {
      if (submit && this.home_member_state === "") {
        this.error.home_member_state = true;
        this.errorText.home_member_state = "Please select a home member state";
        document.getElementById('inputHomeMemberState').setCustomValidity("invalid");
        return false;
      }
      this.error.home_member_state = false;
      this.errorText.home_member_state = "No error";
      document.getElementById('inputHomeMemberState').setCustomValidity("");
      return true;
    },

    validateIdentifierId(submit) {
      //nothing to check
      this.error.identifier_id = false;
      this.errorText.identifier_id = "No error";      
      return true;
    },

    validateIdentifierValue(submit) {      
      if (submit && this.identifier_value === "") {
        this.error.identifier_value = true;
        this.errorText.identifier_value = "The identifier value is empty";
        document.getElementById('inputLegalIdentifier').setCustomValidity("invalid");
        return false;
      }

      if (this.identifier_value.length < 3) {
        this.error.identifier_value = true;
        this.errorText.identifier_value = "The identifier value is too short";
        document.getElementById('inputLegalIdentifier').setCustomValidity("invalid");
        return false;
      }

      switch (this.identifier_id) {
        case "1": //LEI
          if (this.identifier_value.length !== 20) {
            this.error.identifier_value = true;
            this.errorText.identifier_value = "Legal Entity Identifier must have 20 characters";
            document.getElementById('inputLegalIdentifier').setCustomValidity("invalid");  
            return false;
          }
        case "2": //VAT Number
          break;
        case "3": //Reg number
          break;
        case "4": //ISIN
          if (this.identifier_value.length !== 12) {
            this.error.identifier_value = true;
            this.errorText.identifier_value = "ISIN number must have 12 characters";
            document.getElementById('inputLegalIdentifier').setCustomValidity("invalid");
            return false;
          }
          if (!Utils.hasCountryCode(this.identifier_value)) {
            this.error.identifier_value = true;
            this.errorText.identifier_value = "ISIN number must starts with the country code";
            document.getElementById('inputLegalIdentifier').setCustomValidity("invalid");
            return false;
          }
        default:
      }

      this.error.identifier_value = false;
      this.errorText.identifier_value = "No error";
      document.getElementById('inputLegalIdentifier').setCustomValidity("");
      return true;
    },

    validateSubclass(submit) {
      if (submit && this.subclass === "") {
        this.error.subclass = true;
        this.errorText.subclass = "Please select a subclass";
        document.getElementById('inputClass').setCustomValidity("invalid");
        return false;
      }

      this.error.subclass = false;
      this.errorText.subclass = "No error";
      document.getElementById('inputClass').setCustomValidity("");
      return true;
    },

    validateDisclosureDate(submit) {
      if (submit && this.disclosure_date === "") {
        this.error.disclosure_date = true;
        this.errorText.disclosure_date = "Please enter the disclosure date";                                 
        document.getElementById('inputDocumentDisclosureDate').setCustomValidity("invalid");
        return true;
      }

      try {
        Utils.ddmmyyyytoDate(this.disclosure_date);
        var date = new Date(this.disclosure_date)
      } catch (e) {
        this.error.disclosure_date = true;
        this.errorText.disclosure_date = "Invalid date format, use dd/mm/yyyy";                                 
        document.getElementById('inputDocumentDisclosureDate').setCustomValidity("invalid");
        return false;
      }
      
      if(date > new Date()){ //prevent future dates
        this.error.disclosure_date = true;
        this.errorText.disclosure_date = "Disclosure date should be today or earlier";                                 
        document.getElementById('inputDocumentDisclosureDate').setCustomValidity("invalid");
        return false;
      }
      
      if( !this.crossValidationDisclosureDateFinancialYear() ){
        this.error.disclosure_date = true;
        this.errorText.disclosure_date = "Please check financial year and disclosure date";                                 
        document.getElementById('inputDocumentDisclosureDate').setCustomValidity("invalid");
        return false;
      }
      
      this.error.disclosure_date = false;
      this.errorText.disclosure_date = "No error";
      document.getElementById('inputDocumentDisclosureDate').setCustomValidity("");
      return true;
    },
    
    validateSubmissionDate(submit) {
      if (this.submission_date === "") {
        this.error.submission_date = true;
        this.errorText.submission_date = "Please enter the submission date";                                 
        document.getElementById('inputDocumentSubmissionDate').setCustomValidity("invalid");
        return true;
      }

      try {
        Utils.ddmmyyyytoDate(this.submission_date);
      } catch (e) {
        this.error.submission_date = true;
        this.errorText.submission_date = "Invalid date format, use dd/mm/yyyy";                                 
        document.getElementById('inputDocumentSubmissionDate').setCustomValidity("invalid");
        return false;
      }
      this.error.submission_date = false;
      this.errorText.submission_date = "No error";
      document.getElementById('inputDocumentSubmissionDate').setCustomValidity("");
      return true;
    },

    validateDocumentLanguage(submit) {
      if (submit && this.document_language === "") {
        this.error.document_language = true;
        this.errorText.document_language = "Please select a document language";
        document.getElementById('inputDocumentLanguage').setCustomValidity("invalid");
        return false;
      }
      this.error.document_language = false;
      this.errorText.document_language = "No error";
      document.getElementById('inputDocumentLanguage').setCustomValidity("");
      return true;
    },

    validateComment(submit) {
      if (submit && this.comment === "") {
        this.error.comment = true
        this.errorText.comment = 'Please define a title'
        document.getElementById('inputComment').setCustomValidity("invalid");
        return false
      }      
      
      this.error.comment = false;
      this.errorText.comment = "No error";
      document.getElementById('inputComment').setCustomValidity("");
      return true;
    },

    validateFinancialYear(submit) {
      if (submit && this.financial_year === "") {
        this.error.financial_year = true;
        this.errorText.financial_year = "Insert the financial year";
        document.getElementById('inputFinancialYear').setCustomValidity("invalid");
        return false;
      }

      var number = this.financial_year;
      if (number !== String(parseInt(number, 10))) {
        this.error.financial_year = true;
        this.errorText.financial_year = "Incorrect year";
        document.getElementById('inputFinancialYear').setCustomValidity("invalid");
        return false;
      }
      
      if(parseInt(number,10) > (new Date()).getFullYear()){ //prevent future dates
        this.error.financial_year = true;
        this.errorText.financial_year = "Financial year should be current year or earlier";                                 
        document.getElementById('inputFinancialYear').setCustomValidity("invalid");
        return false;
      }
      
      if( !this.crossValidationDisclosureDateFinancialYear() ){
        this.error.financial_year = true;
        this.errorText.financial_year = "Please check financial year and disclosure date";                                 
        document.getElementById('inputFinancialYear').setCustomValidity("invalid");
        return false;
      }      
      
      this.error.financial_year = false;
      this.errorText.financial_year = "No error";
      document.getElementById('inputFinancialYear').setCustomValidity("");
      return true;
    },

    validateFile(submit) {
      if (submit && document.getElementById("inputFile").files.length === 0) {
        this.error.file = true;
        this.errorText.file = "Please select a file";
        document.getElementById('inputFile').setCustomValidity("invalid");
        return false;
      }
      
      var f = document.getElementById("inputFile").files[0]
      /*
       * f.lastModified: 1540809732971
       * f.lastModifiedDate: Mon Oct 29 2018 11:42:12 GMT+0100 (Central European Standard Time) {}
       * f.name: "2017-Annual Report Groep N.V..pdf"
       * f.size: 9981843
       * f.type: "application/pdf"
       * f.webkitRelativePath: ""
       */
      
      if(f.size > this.serverConfig.maximum_file_size) {
        this.error.file = true;
        this.errorText.file = 'Maximum upload file size: '+Utils.prettyFileSize(this.serverConfig.maximum_file_size);
        document.getElementById('inputFile').setCustomValidity("invalid");        
        return false;        
      }
      this.error.file = false;
      this.errorText.file = "No error";
      document.getElementById('inputFile').setCustomValidity("");
      return true;
    },
    
    crossValidationDisclosureDateFinancialYear() {
      if(!this.showFinancialYear) return true
      try{
        var yearDisc = Utils.ddmmyyyytoDate(this.disclosure_date).getFullYear()
        var year = parseInt(this.financial_year)                        
      }catch(error){
        console.log(error)
        return false
      }
      
      return (year == yearDisc - 1 || year == yearDisc)
    },
    
    showInfo(msg){
      this.alert.info = true
      this.alertText.info = msg
    },
    
    hideInfo(){
      this.alert.info = false
      this.alertText.info = ''
    },
    
    showSuccess(msg) {
      this.alert.success = true
      this.alertText.success = msg
    },
    
    hideSuccess() {
      this.alert.success = false
      this.alertText.success = ''
    },
    
    showDanger(msg) {
      this.alert.danger = true
      this.alertText.danger = msg
    },
    
    hideDanger() {
      this.alert.danger = false
      this.alertText.danger = ''
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
