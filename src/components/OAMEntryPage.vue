<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <form novalidate>
      <div class="container p-5 eftg-container">
        <div class="col-md-6">
          <div class="form-group row">
            <label for="inputIssuerName" class="col-md-3 col-form-label">*Company name</label>
            <div class="col-md-9">
              <input type="text" id="inputIssuerName" v-model="issuer_name" placeholder="Company" :class="{'was-validated': !error.issuer_name }"/>    
              <div v-if="error.issuer_name" class="invalid-feedback">{{ errorText.issuer_name }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label for="inputHomeMemberState" class="col-md-3 col-form-label">*Company country</label>
            <div class="col-md-9">
              <select class="form-control" id="inputHomeMemberState" v-model="home_member_state">
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
            <label for="inputLegalIdentifier" class="col-md-3 col-form-label">*Legal entity identifier</label>
            <div class="col-md-9">
              <div class="btn-group" role="group" aria-label="legal identifier">
                <button type="button" class="btn" v-model="identifier_id" value="1">LEI</button>
                <button type="button" class="btn" v-model="identifier_id" value="4">ISIN</button>
                <button type="button" class="btn" v-model="identifier_id" value="2">Vat number</button>
                <button type="button" class="btn" v-model="identifier_id" value="3">Reg number</button>
              </div>
              <input type="text" id="inputLegalIdentifier" 
                     v-model="identifier_value" placeholder="" 
                     :class="{'was-validated': !error.identifier_value }"
              />
              <div v-if="error.identifier_value" class="invalid-feedback">{{ errorText.identifier_value }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label for="inputClass" class="col-md-3 col-form-label">*Document class and subclass</label>
            <div class="col-md-9">
              <select class="form-control" id="inputClass" v-model="subclass">
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
            <label for="inputDocumentDisclosureDate" class="col-md-3 col-form-label">Document disclosure date</label>
            <div class="col-md-9">
              <input type="text" id="inputDocumentDisclosureDate" 
                 v-model="disclosure_date" placeholder="dd/mm/yyyy" 
                 :class="{'was-validated': !error.disclosure_date }"
              />    
              <div v-if="error.disclosure_date" class="invalid-feedback">{{ errorText.disclosure_date }}</div>
            </div>
          </div>
          <div class="form-group row">
            <label for="inputDocumentLanguage" class="col-md-3 col-form-label">Document language</label>
            <div class="col-md-9">
              <select class="form-control" id="inputDocumentLanguage" v-model="document_language">
                <option value="">Please select one</option>
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
          
        </div>
      </div>
    </form>  
    <div id="bodyForm">
      <div><div class="form-label">*Indicates required field</div></div>
      <div class="form">        
        
      </div>
      <div class="form">
        <div class="block-input">
          <div class="form-label">Document language</div>
          <select v-model="document_language">
            <option value=""></option>
            <option
              v-for="option in languages"
              v-bind:key="option.id"
              v-bind:value="option.id"
            >
              {{ option.name }}
            </option>
          </select>
        </div>
        <div class="block-input">
          <div class="form-label">Document title</div>
          <input
            type="text"
            v-model="comment"
            placeholder="e.g. Company ABC 2016 Annual Financial Report"
          />
        </div>
        <div class="block-input">
          <div class="form-label">*Document financial year</div>
          <div class="form-input-error">
            <input
              type="text"
              v-model="financial_year"
              :class="{ dangertext: error.financial_year }"
            />
            <div v-if="error.financial_year" class="small dangertext">
              {{ errorText.financial_year }}
            </div>
          </div>
        </div>
      </div>
      <div class="form-input-error">
        <input
          type="file"
          name="file"
          id="file"
          @change="validateFile"
          class="inputfile"
        />
        <label for="file">Upload file</label>
        <div v-if="error.file" class="small dangertext">
          {{ errorText.file }}
        </div>
      </div>
      <div class="right">
        <button v-on:click="submit">Submit</button>
        <button v-on:click="clear">Clear</button>
      </div>
    </div>
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

        if (!valid) {
          console.log("Error validating fields!");
          return false;
        }

        //User credentials
        if (!self.$refs.headerEFTG.auth.logged) {
          self.$refs.headerEFTG.login();
          //todo: make than after login it submits the post automatically
          return;
        }
        var username = self.$refs.headerEFTG.auth.user;
        var privKey = self.$refs.headerEFTG.auth.keys.posting;

        //read file, calculation of the hash, and signature with privkey
        //(format used in ImageHoster for uploading)
        var localFile = document.getElementById("file").files[0];
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

        var body = "[[pdf link]](" + pdfUrl + "}})";

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
        var addRandom = false;
        while (true) {
          var permlink = Utils.createPermLink(self.comment, addRandom);
          var urlPost = "oam/@" + username + "/" + permlink;
          var post = await client.database.getState(urlPost);
          console.log(post);
          break;
        }

        var post = {
          author: username,
          body: body, //todo: link pdf
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
      var input = document.getElementById("file");
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
        return false;
      }
      if (this.issuer_name.length > 200) {
        this.error.issuer_name = true;
        this.errorText.issuer_name = "The issuer name is too long";
        return false;
      }
      this.error.issuer_name = false;
      this.errorText.issuer_name = "No error";
      return true;
    },

    validateHomeMemberState(submit) {
      if (submit && this.home_member_state === "") {
        this.error.home_member_state = true;
        this.errorText.home_member_state = "Please select a home member state";
        return false;
      }
      this.error.home_member_state = false;
      this.errorText.home_member_state = "No error";
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
        return false;
      }

      if (this.identifier_value.length < 3) {
        this.error.identifier_value = true;
        this.errorText.identifier_value = "The identifier value is too short";
        return false;
      }

      switch (this.identifier_id) {
        case "1": //LEI
          if (this.identifier_value.length !== 20) {
            this.error.identifier_value = true;
            this.errorText.identifier_value =
              "Legal Entity Identifier must have 20 characters";
            return false;
          }
        case "2": //VAT Number
          break;
        case "3": //Reg number
          break;
        case "4": //ISIN
          if (this.identifier_value.length !== 12) {
            this.error.identifier_value = true;
            this.errorText.identifier_value =
              "ISIN number must have 12 characters";
            return false;
          }
          if (!Utils.hasCountryCode(this.identifier_value)) {
            this.error.identifier_value = true;
            this.errorText.identifier_value =
              "ISIN number must starts with the country code";
            return false;
          }
        default:
      }

      this.error.identifier_value = false;
      this.errorText.identifier_value = "No error";
      return true;
    },

    validateSubclass(submit) {
      if (submit && this.subclass === "") {
        this.error.subclass = true;
        this.errorText.subclass = "Please select a subclass";
        return false;
      }

      this.error.subclass = false;
      this.errorText.subclass = "No error";
      return true;
    },

    validateDisclosureDate(submit) {
      //this is an optional field
      if (this.disclosure_date === "") {
        this.error.disclosure_date = false;
        this.errorText.disclosure_date = "No error";
        return true;
      }

      try {
        Utils.ddmmyyyytoDate(this.disclosure_date);
      } catch (e) {
        this.error.disclosure_date = true;
        this.errorText.disclosure_date = "Invalid date format, use dd/mm/yyyy";
        return false;
      }
      this.error.disclosure_date = false;
      this.errorText.disclosure_date = "No error";
      return true;
    },

    validateDocumentLanguage(submit) {
      //this is an optional field
      //nothing to check
      this.error.document_language = false;
      this.errorText.document_language = "No error";
      return true;
    },

    validateComment(submit) {
      //this is an optional field
      //nothing to check
      this.error.comment = false;
      this.errorText.comment = "No error";
      return true;
    },

    validateFinancialYear(submit) {
      //this is an optional field
      if (this.financial_year === "") {
        this.error.financial_year = false;
        this.errorText.financial_year = "No error";
        return true;
      }

      var number = this.financial_year;
      if (number !== String(parseInt(number, 10))) {
        this.error.financial_year = true;
        this.errorText.financial_year = "Incorrect year";
        return false;
      }
      this.error.financial_year = false;
      this.errorText.financial_year = "No error";
      return true;
    },

    validateFile(submit) {
      if (submit && document.getElementById("file").files.length === 0) {
        this.error.file = true;
        this.errorText.file = "Please select a file";
        return false;
      }
      this.error.file = false;
      this.errorText.file = "No error";
      return true;
    }
  }
};
</script>

<style scoped>
#bodyForm {
}

.form {
  display: inline-block;
}

.form-label {
  display: inline-block;
}

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

.dangertext {
  color: red;
}
</style>
