<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <form id="eftg-form" novalidate>
      <div class="container p-5 eftg-container">
        <div class="row">
          <label class="col-md-12 col-form-label">*Indicates required field</label>          
          <div class="col-md-6">
            <div class="form-group row">
              <label for="inputIssuerName" class="col-md-5 col-form-label">*Company name</label>
              <div class="col-md-7">
                <input class="form-control" type="text" id="inputIssuerName" 
                       v-model="issuer_name" placeholder="Company" :class="{'is-invalid': error.issuer_name }"/>
                <div v-if="error.issuer_name" class="invalid-feedback">{{ errorText.issuer_name }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputHomeMemberState" class="col-md-5 col-form-label">*Company country</label>
              <div class="col-md-7">
                <select class="form-control" id="inputHomeMemberState" v-model="home_member_state" :class="{'is-invalid': error.home_member_state }">
                  <option disabled value="">Please select one</option>
                  <option
                    v-for="option in optionsHomeMemberState"
                    v-bind:key="option.id"
                    v-bind:value="option.id"
                  >
                    {{ option.name }}
                  </option>
                </select>
                <div v-if="error.home_member_state" class="invalid-feedback">{{ errorText.home_member_state }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputLegalIdentifier" class="col-md-5 col-form-label">*Legal entity identifier</label>
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
                       v-model="identifier_value" placeholder="" 
                       class="form-control"
                       :class="{'is-invalid': error.identifier_value }"
                />
                <div v-if="error.identifier_value" class="invalid-feedback">{{ errorText.identifier_value }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputClass" class="col-md-5 col-form-label">*Document class and subclass</label>
              <div class="col-md-7">
                <select class="form-control" id="inputClass" v-model="subclass" :class="{'is-invalid': error.subclass }">
                  <option disabled value="">Please select one</option>
                  <option disabled value="">{{ docClasses[0].name }}</option>
                  <option
                    v-for="option in docClasses[0].subclass"
                    v-bind:key="option.id"
                    v-bind:value="option.id"
                  >
                    {{ option.name }}
                  </option>
                  <option disabled value="">{{ docClasses[1].name }}</option>
                  <option
                    v-for="option in docClasses[1].subclass"
                    v-bind:key="option.id"
                    v-bind:value="option.id"
                  >
                    {{ option.name }}
                  </option>
                </select>
                <div v-if="error.subclass" class="invalid-feedback">{{ errorText.subclass }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group row">
              <label for="inputDocumentDisclosureDate" class="col-md-5 col-form-label">Document disclosure date</label>
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
              <label for="inputDocumentLanguage" class="col-md-5 col-form-label">Document language</label>
              <div class="col-md-7">
                <select class="form-control" id="inputDocumentLanguage" v-model="document_language" :class="{'is-invalid': error.document_language }">
                  <option value=""></option>
                  <option
                    v-for="option in languages"
                    v-bind:key="option.id"
                    v-bind:value="option.id"
                  >
                    {{ option.name }}
                  </option>
                </select>
                <div v-if="error.document_language" class="invalid-feedback">{{ errorText.document_language }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputComment" class="col-md-5 col-form-label">Document title</label>
              <div class="col-md-7">
                <input type="text" id="inputComment" v-model="comment" placeholder="" class="form-control" :class="{'is-invalid': error.comment }"/>    
                <div v-if="error.comment" class="invalid-feedback">{{ errorText.comment }}</div>
              </div>
            </div>
            <div class="form-group row">
              <label for="inputFinancialYear" class="col-md-5 col-form-label">Document financial year</label>
              <div class="col-md-7">
                <input type="text" id="inputFinancialYear" v-model="financial_year" placeholder="" class="form-control" :class="{'is-invalid': error.financial_year }"/>
                <div v-if="error.financial_year" class="invalid-feedback">{{ errorText.financial_year }}</div>
              </div>
            </div>            
          </div>            
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
          <div class="form-group col-md-12 align-bottom" style="padding-top: 8px;">
            <button v-on:click="submit" class="btn btn-primary eftg-btn-primary">Submit</button>
            <button v-on:click="clear"  class="btn btn-secondary eftg-btn-primary">Clear</button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Config from "@/config.js";
import Utils from "@/js/utils.js";
import debounce from "lodash.debounce";
import axios from "axios";
import Crypto from "crypto";
import HeaderEFTG from "@/components/HeaderEFTG";


export default {
  name: "OAMEntryPage",
  
  data() {
    return {
      issuer_name: "",
      home_member_state: "",
      identifier_id: "1",
      identifier_value: "",
      subclass: "",
      disclosure_date: "",
      document_language: "",
      comment: "",
      financial_year: "",
      optionsHomeMemberState: [
        {
          id: "RO",
          name: "Romania"
        },
        {
          id: "SP",
          name: "Spain"
        }
      ],
      docClasses: [
        {
          id: 1,
          name: "Periodic Regulated Information",
          subclass: [
            {
              id: 3,
              name: "Annual Financial Report"
            },
            {
              id: 4,
              name: "Half-Year Financial Report"
            },
            {
              id: 5,
              name: "Interim Management Statement"
            }
          ]
        },
        {
          id: 2,
          name: "Ongoing Regulated Information",
          subclass: [
            {
              id: 6,
              name: "Home Member State"
            },
            {
              id: 7,
              name: "Inside Information"
            }
          ]
        }
      ],
      languages: [
        { id: "en-uk", name: "English" },
        { id: "sp", name: "Spanish" }
      ],
      identifiers: {
        "1": "LEI",
        "2": "VAT",
        "3": "RegistrationNumber"
      },
      error: {
        issuer_name: false,
        home_member_state: false,
        identifier_id: false,
        identifier_value: false,
        subclass: false,
        disclosure_date: false,
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
        document_language: "No error",
        comment: "No error",
        financial_year: "No error",
        file: "No error"
      }
    };
  },
  components: {
    HeaderEFTG
  },
  created() {
    this.debounced_validateIssuerName = debounce(this.validateIssuerName, 300);
    this.debounced_validateHomeMemberState = debounce(
      this.validateHomeMemberState,
      300
    );
    this.debounced_validateIdentifierId = debounce(
      this.validateIdentifierId,
      300
    );
    this.debounced_validateIdentifierValue = debounce(
      this.validateIdentifierValue,
      300
    );
    this.debounced_validateSubclass = debounce(this.validateSubclass, 300);
    this.debounced_validateDisclosureDate = debounce(
      this.validateDisclosureDate,
      300
    );
    this.debounced_validateDocumentLanguage = debounce(
      this.validateDocumentLanguage,
      300
    );
    this.debounced_validateComment = debounce(this.validateComment, 300);
    this.debounced_validateFinancialYear = debounce(
      this.validateFinancialYear,
      300
    );
  },
  mounted() {
    this.startEventListenerFile();
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
    subclass: function() {
      this.debounced_validateSubclass();
    },
    disclosure_date: function() {
      this.debounced_validateDisclosureDate();
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
        valid = self.validateComment(true) && valid;
        valid = self.validateFinancialYear(true) && valid;
        valid = self.validateFile(true) && valid;

        var form = document.getElementById('eftg-form');
        form.classList.add('was-validated');
        
        if (!valid) {
          console.log("Error validating fields!");
          return false;
        }

        //User credentials
        if (!self.$refs.headerEFTG.auth.logged) {
          self.$refs.headerEFTG.login();
          //todo: make that after login it submits the post automatically
          return;
        }
        var username = self.$refs.headerEFTG.auth.user;
        var privKey = self.$refs.headerEFTG.auth.keys.posting;

        //read file, calculation of the hash, and signature with privkey
        //(format used in ImageHoster for uploading)
        var localFile = document.getElementById("inputFile").files[0];
        var fileData = await self.readFileAsBuffer(localFile);
        const imageHash = Crypto.createHash("sha256")
          .update("ImageSigningChallenge")
          .update(fileData)
          .digest();
        const signature = privKey.sign(imageHash).toString();
        console.log("signature:" + signature);

        //Uploading the file

        var formFile = new FormData();
        formFile.append("pdf", localFile);
        var urlWithSignature =
          Config.IMAGE_HOSTER.url + "/" + username + "/" + signature;

        //TODO: try - catch to check if the file size is too long and there is an error
        var response = await axios.post(urlWithSignature, formFile);
        var pdfUrl = response.data.url;

        console.log("response from image hoster");
        console.log(response);

        //Creation of the new post in the blockchain
        var discDate = "";
        try {
          discDate = Utils.dateToString(
            Utils.ddmmyyyytoDate(self.disclosure_date)
          );
        } catch (e) {
          discDate = "";
        }

        var body = "[[pdf link]](" + pdfUrl + ")";

        var json_metadata = {
          issuer_name: self.issuer_name,
          home_member_state: self.home_member_state,
          identifier_id: self.identifier_id,
          identifier_value: self.identifier_value,
          subclass: self.subclass,
          disclosure_date: discDate,
          document_language: self.document_language,
          comment: self.comment,
          financial_year: self.financial_year,
          tags: [
            self.subclass,
            self.issuer_name,
            self.home_member_state,
            self.identifier_value
          ],
          submission_date: Utils.dateToString(new Date())
        };

        //create a permlink taking into account the existing posts
        var client = new dsteem.Client(Config.RPC_NODE.url);
        
        // TODO: addRandom starts false and we check if the post exists using dsteem 
        var addRandom = true;
        while (true) {
          var permlink = Utils.createPermLink(self.comment, addRandom);
          var urlPost = "oam/@" + username + "/" + permlink;
          var post = await client.database.getState(urlPost);
          console.log(post);
          //TODO: fix dsteem response problem... if the post exists, then addRandom=true and continue the while loop, else break
          break;
        }

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

        var result = await client.broadcast.comment(post, privKey);
        console.log("document publised!");
        console.log(result);
      }
      submit_async().catch(console.error);
    },

    clear() {
      this.issuer_name = "";
      this.home_member_state = "";
      this.identifier_id = "1";
      this.identifier_value = "";
      this.subclass = "";
      this.disclosure_date = "";
      this.document_language = "";
      this.comment = "";
      this.financial_year = "";
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
    async readFileAsBuffer(inputFile) {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject(new DOMException("Problem parsing file to upload"));
        };

        reader.onload = () => {
          //the result is an ArrayBuffer, we change it to Buffer.
          //this is important because the hash using 'crypto' is different in the 2 cases

          //TODO: [es-lint] says that Buffer is not defined, however it works
          var dataArrayBuffer = reader.result;
          var dataBuffer = new Buffer(dataArrayBuffer);
          resolve(dataBuffer);
        };
        reader.readAsArrayBuffer(inputFile);
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
      //this is an optional field
      if (this.disclosure_date === "") {
        this.error.disclosure_date = false;
        this.errorText.disclosure_date = "No error";                                 
        document.getElementById('inputDocumentDisclosureDate').setCustomValidity("");
        return true;
      }

      try {
        Utils.ddmmyyyytoDate(this.disclosure_date);
      } catch (e) {
        this.error.disclosure_date = true;
        this.errorText.disclosure_date = "Invalid date format, use dd/mm/yyyy";                                 
        document.getElementById('inputDocumentDisclosureDate').setCustomValidity("invalid");
        return false;
      }
      this.error.disclosure_date = false;
      this.errorText.disclosure_date = "No error";
      document.getElementById('inputDocumentDisclosureDate').setCustomValidity("");
      return true;
    },

    validateDocumentLanguage(submit) {
      //this is an optional field
      //nothing to check
      this.error.document_language = false;
      this.errorText.document_language = "No error";
      document.getElementById('inputDocumentLanguage').setCustomValidity("");
      return true;
    },

    validateComment(submit) {
      //this is an optional field
      //nothing to check
      this.error.comment = false;
      this.errorText.comment = "No error";
      document.getElementById('inputComment').setCustomValidity("");
      return true;
    },

    validateFinancialYear(submit) {
      //this is an optional field
      if (this.financial_year === "") {
        this.error.financial_year = false;
        this.errorText.financial_year = "No error";
        document.getElementById('inputFinancialYear').setCustomValidity("");
        return true;
      }

      var number = this.financial_year;
      if (number !== String(parseInt(number, 10))) {
        this.error.financial_year = true;
        this.errorText.financial_year = "Incorrect year";
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
      this.error.file = false;
      this.errorText.file = "No error";
      document.getElementById('inputFile').setCustomValidity("");
      return true;
    }
  }
};
</script>

<style scoped>

.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.inputfile + label {
  font-size: 1.25em;
  font-weight: 700;
  color: white;
  background-color: black;
  display: inline-block;
  cursor: pointer;
}

.inputfile:focus + label,
.inputfile + label:hover {
  background-color: red;
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}

.was-validated {  
}

.anvalid-feedback {
  color: red;
}

.invalid-feedback2 {
  color: red;
}

</style>
