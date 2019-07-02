<template>
  <div>
    <HeaderEFTG portal="Investor Portal" :showAuth="true" ref="headerEFTG" v-on:login="onLogin" v-on:logout="onLogout"></HeaderEFTG>
    <div> <!--<form>-->
    <div class="container">
      <h2 class="text-center">European Financial Transparency Gateway</h2>
      <h3 class="text-center mb-5">Investor Portal</h3>
      <div class="row">
        <div class="col-md-12">
          <div class="form-row">
            <fieldset class="form-group col-md-6">
              <label class="eftg-label">COMPANY NAME</label>
              <multiselect v-model="issuerName" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select Company Name" label="name" track-by="name" :options="pulsarApi.issuerNames" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
            <fieldset class="form-group col-md-6">
              <label class="eftg-label">COMPANY'S HOME COUNTRY</label>
              <multiselect v-model="homeMemberState" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select Company's Home Country" label="label" track-by="code" :options="dictionary.homeMemberStates" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
          </div>
          <div class="form-row">
            <fieldset class="form-group col-md-3">
              <label class="eftg-label">DISCLOSURE DATE FROM</label>
              <input v-model="disclosureDateFrom" type="date" class="form-control" placeholder="dd/mm/yyyy">
            </fieldset>
            <fieldset class="form-group col-md-3">
              <label class="eftg-label">DISCLOSURE DATE TO</label>
              <input v-model="disclosureDateTo" type="date" class="form-control" placeholder="dd/mm/yyyy">
            </fieldset>
            <fieldset class="form-group col-md-6">
              <label class="eftg-label">LEGAL IDENTIFIER</label>
              <multiselect v-model="legalIdentifier" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select legal identifier" label="identifier_value" track-by="identifier_value" :options="pulsarApi.legalIdentifiers" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
          </div>
          <div class="form-row">
            <fieldset class="form-group col-md-9">
              <label class="eftg-label">DOCUMENT TYPE</label>
              <multiselect v-model="subclass" class="eftg-multiselect" tag-placeholder="Select" placeholder="Search or choose" label="label" track-by="id" :options="dictionary.docClassSubclass" :multiple="true" :taggable="true" @tag="addTag" @input="onChangeDocClass"></multiselect>
            </fieldset>
            <fieldset class="form-group col-md-3">
              <label class="eftg-label">FINANCIAL YEAR</label>
              <multiselect v-model="financialYear" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select financial year" label="id" :showLabels="false" track-by="id" :options="optionsFinancialYear" :multiple="true"  :disabled="financialYearDisabled" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
          </div>
          <div class="form-row">
            <fieldset class="form-group col-md-9">
              <label class="eftg-label">SEARCH TITLE BY KEYWORD</label>
              <input v-model="title" type="text" class="form-control" aria-label="Input keywords" placeholder="Keywords">
            </fieldset>
            <fieldset class="form-group col-md-3 align-bottom" style="padding-top: 8px;">
              <br/>
              <button type="submit" class="btn btn-primary eftg-btn-primary mr-2" v-on:click="submit">Submit</button>
              <button type="button" class="btn btn-secondary eftg-btn-secondary" v-on:click="clear">Clear</button>
            </fieldset>
          </div>
        </div>
        <div class="col-md-3" hidden>
            <div id="pdfPreview_" class="eftg-pdf-preview">
              <!-- <img src="../assets/pdf-preview.png" style="width: 95%"/> -->
            </div>
        </div>
      </div>
    </div>
    <div>
      <!-- Modal Component -->
      <b-modal id="mdPdfPreview" v-bind:title="docName" size="lg" centered>
        <div v-if="fileExtension !== 'pdf'">This file is not a PDF. Extension detected: {{fileExtension}}</div>
        <div v-else>
          <div id="pdfPreview" style="min-height: 600px !important; height: 600px !important;"></div>
        </div>
        <div slot="modal-footer" class="w-100">
          <div class="text-right">
            <button size="sm" class="btn ui basic button" @click="hideModal">
              Close
            </button>
            <button size="sm" class="btn ui basic button" @click="onAction('download-item', tempData, tempIndex)">
              <font-awesome-icon :icon="faDownload" />
            </button>
          </div>
        </div>
      </b-modal>
    </div>
    </div>
    <div class="container">
      <h3>Search results</h3>
    </div>
    <div>
      <search-vuetable
      ref='searchvuetable'
      :api-url="searchApiUrl"
      :elastic-api-url="elasticApiUrl"
      :fields="fields"
      :sort-order="sortOrder"
      :append-params="moreParams"
      detail-row-id="id"
      detail-row-component="search-detail-row"
    >
      <template slot="actions" slot-scope="props">
        <div class="custom-actions">
          <div v-if="props.rowData.has_permission" class="row">
            <div class="col-md-6">
              <button class="btn ui basic button" @click="onAction('view-item', props.rowData, props.rowIndex)" v-b-modal.mdPdfPreview><font-awesome-icon :icon="faEye" /></button>
            </div>
            <div class="col-md-6">
              <button class="btn ui basic button" @click="onAction('download-item', props.rowData, props.rowIndex)"><font-awesome-icon :icon="faDownload" /></button>
            </div>
          </div>
          <div v-else class="row">
            <div class="col-12">
              <button class="btn btn-secondary" @click="openSubscription(props.rowData.author, props.rowData.subclass)">Subscribe</button>
            </div>
          </div>
        </div>
      </template>
      </search-vuetable>
      <b-modal ref="modalSubscribe" hide-footer title="Subscribe">
        <p>In order to access this document, please contact your local OAM</p>
        <div class="row">
          <div class="form-group col-12 align-bottom mt-2">
            <button class="btn btn-primary mr-2">Subscribe</button>
            <button @click="closeSubscription" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </b-modal>
    </div>
    <div class="container">
      <div class="eftg-footnotes">
        <b>Definitions:</b>
        <ul>
          <li>*The disclosure date corresponds to the official date of document release as set by the Issuer.</li>
          <li>**The submission date corresponds to the date at which the issuer gives the information to the OAM.</li>
          <li>***Financial year is the year that the financial document is referring to (only valid for Periodic Regulated Information).</li>
        </ul>
      </div>
    </div>
  </div>

</template>

<script>
import Vue from 'vue';
import Config from "@/config.js";
import Utils from "@/js/utils.js";
import PulsarApi from "@/mixins/PulsarApi.js";
import Dictionary from "@/mixins/Dictionary.js";
import HeaderEFTG from "@/components/HeaderEFTG";
import Multiselect from 'vue-multiselect';
import SearchVuetable from './SearchVuetable';
import FieldDefs from './SearchFieldDefs.js';
import DetailRow from './SearchDetailRow';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import PDFObject from 'pdfobject';

Vue.component('search-vuetable', SearchVuetable);
Vue.component('search-detail-row', DetailRow);
Vue.component('font-awesome-icon', FontAwesomeIcon)


export default {
  name: "SearchPage",
  data() {
    return {
      docName: 'PDF Download',
      fileExtension: 'pdf',
      tempData: '',
      tempIndex: '',
      showModal: false,
      faDownload: faDownload,
      faEye: faEye,
      fields: FieldDefs,
      sortOrder: [
        {
          field: 'storage_date',
          sortField: 'storage_date',
          direction: 'desc'
        }
      ],
      moreParams: {},
      issuerName: [],
      disclosureDateFrom: null,
      disclosureDateTo: null,
      homeMemberState: [],
      legalIdentifier: [],
      financialYear: [],
      financialYearDisabled: false,
      optionsFinancialYear: [{
          id: "2018"
        }, {
          id: "2017"
        }, {
          id: "2016"
        }, {
          id: "2015"
        }
      ],
      subclass: [],
      title: "",
      searchApiUrl: Config.CDN + 'search.json',
      elasticApiUrl: Config.ELASTIC
    };
  },
  components: {
    HeaderEFTG, Multiselect, SearchVuetable, FontAwesomeIcon
  },
  mixins: [
    PulsarApi, Dictionary
  ],
  mounted() {

  },
  methods: {
    addTag (newTag) {
      console.log(newTag);
      const tag = {
        name: newTag,
        id: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
    },
    submit() {
      this.$refs.searchvuetable.refresh({
        legalIdentifier: this.legalIdentifier,
        issuerName: this.issuerName,
        homeMemberState: this.homeMemberState,
        subclass: this.subclass,
        financialYear: this.financialYear,
        title: this.title,
        disclosureDateFrom: this.disclosureDateFrom,
        disclosureDateTo: this.disclosureDateTo
      }, 1);
    },
    onChangeDocClass() {
      this.financialYearDisabled = false;
      if(this.subclass.length > 0) {
        this.financialYearDisabled = true;
        for (var i = 0; i < this.subclass.length; i++) {
          if(this.subclass[i].id < 200) {
            this.financialYear = [];
            this.financialYearDisabled = false;
          }
        }
      }
    },
    clear() {
      this.legalIdentifier = [];
      this.issuerName = [];
      this.homeMemberState = [];
      this.subclass = [];
      this.financialYear = [];
      this.title = '';
      this.disclosureDateFrom = null,
      this.disclosureDateTo = null;

      this.$refs.searchvuetable.refresh({
        legalIdentifier: this.legalIdentifier,
        issuerName: this.issuerName,
        homeMemberState: this.homeMemberState,
        subclass: this.subclass,
        financialYear: this.financialYear,
        title: this.title,
        disclosureDateFrom: this.disclosureDateFrom,
        disclosureDateTo: this.disclosureDateTo
      });
    },
    onAction (action, data, index) {
      if (action === 'view-item') {
        this.docName = data.comment + ' - ' + data.financial_year ;
        this.tempData = data;
        this.tempIndex = index;
        this.fileExtension = data.document_url.split('.').pop().toLowerCase()
        if(this.fileExtension === 'pdf') this.$nextTick( ()=> { this.viewPdf(data.document_url) })
      } else if(action === "download-item") {
        this.hideModal();
        window.open(data.document_url, '_blank'); return false;
      }
    },
    viewPdf(file){
      var options = {
        pdfOpenParams: {
          pagemode: "thumbs",
          navpanes: 0,
          toolbar: 0,
          statusbar: 0,
          view: "FitH"
        }
      };
      var myPDF = PDFObject.embed(file, "#pdfPreview", options);
    },
    hideModal () {
      this.$root.$emit('bv::hide::modal','mdPdfPreview')
    },

    openSubscription(owner, subclass) {
      this.$refs.modalSubscribe.show()
    },

    closeSubscription() {
      this.$refs.modalSubscribe.hide()
    },

    onLogin () {
      this.$refs.searchvuetable.onLogin()
    },

    onLogout () {
      this.$refs.searchvuetable.onLogout()
    },
  }
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
.eftg-multiselect .multiselect__tags .multiselect__tags-wrap .multiselect__tag {
  background-color: #0F5494;
}

.eftg-multiselect .multiselect__tags .multiselect__tags-wrap .multiselect__tag .multiselect__tag-icon:after{
  background-color: #0F5494;
}

.multiselect__tag-icon:focus, .multiselect__tag-icon:hover{background:rgb(24, 89, 150);}

</style>
<style scoped>
.eftg-label {
  font-size: 12px;
  color: #AEAEAE;
}

.eftg-container {

}

.eftg-pdf-preview {
  height: 340px;
  padding: 5px;
  text-align: center;
  background-color: #ccc;
  border: 5px solid #aaa;
  overflow: hidden;
}

.eftg-btn-primary {
  background-color: #0F5494;
}

.eftg-btn-secondary {
  background-color:#C3C3C3;
}

</style>

