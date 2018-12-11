<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <form>
    <div class="container p-5 eftg-container">
      <div class="row">
        <div class="col-md-9">
          <div class="form-row">
            <fieldset class="form-group col-md-6">
              <label class="eftg-label">ISSUER NAME</label>
              <multiselect v-model="issuerName" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select Issuer Name" label="name" track-by="id" :options="optionsIssuerName" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
            <fieldset class="form-group col-md-6">
              <label class="eftg-label">HOME MEMBER STATE</label>
              <multiselect v-model="homeMemberState" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select Home Member State" label="name" track-by="id" :options="optionsHomeMemberState" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
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
              <multiselect v-model="legalIdentifier" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select legal identifier" label="name" track-by="id" :options="optionsLegalIdentifier" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
          </div>
          <div class="form-row">
            <fieldset class="form-group col-md-9">
              <label class="eftg-label">DOCUMENT CLASS AND SUBCLASS</label>
              <multiselect v-model="docClass" class="eftg-multiselect" tag-placeholder="Select" placeholder="Search or choose" label="name" track-by="id" :options="optionsDocClass" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
            <fieldset class="form-group col-md-3">
              <label class="eftg-label">FINANCIAL YEAR</label>
              <multiselect v-model="financialYear" class="eftg-multiselect" tag-placeholder="Select" placeholder="Select financial year" label="id" :showLabels="false" track-by="id" :options="optionsFinancialYear" :multiple="true" :taggable="true" @tag="addTag"></multiselect>
            </fieldset>
          </div>
          <div class="form-row">
            <fieldset class="form-group col-md-9">
              <label class="eftg-label">SEARCH TITLE BY KEYWORD</label>
              <input v-model="title" type="text" class="form-control" aria-label="Input keywords" placeholder="Keywords">
            </fieldset>
            <fieldset class="form-group col-md-3 align-bottom" style="padding-top: 8px;">
              <br/>
              <button type="submit" class="btn btn-primary eftg-btn-primary" v-on:click="submit">Submit</button>
              <button type="button" class="btn btn-secondary eftg-btn-secondary" v-on:click="clear">Clear</button>
            </fieldset>
          </div>
        </div>
        <div class="col-md-3">
            <div class="eftg-pdf-preview">PDF PREVIEW</div>
        </div>
      </div>
    </div>
    </form>
    <div>
      <search-vuetable
      api-url="https://raw.githubusercontent.com/scr53005/eftg-steem/master/dictionary/search.json"
      :fields="fields"
      :sort-order="sortOrder"
      :append-params="moreParams"
      detail-row-component="my-detail-row"
    >
      <template slot="actions" slot-scope="props">
        <div class="custom-actions">
            <button type="button" class="btn btn-secondary eftg-btn-secondary" @click="onAction('view-item', props.rowData, props.rowIndex)">pdf</button>
        </div>
      </template>
    </search-vuetable>
    </div>
    <div>
        <pre class="language-json">Issuer Name<code>{{ issuerName  }}</code></pre>
        <pre class="language-json">Home Member State<code>{{ homeMemberState  }}</code></pre>
        <pre class="language-json">Disclosure Date From<code>{{ disclosureDateFrom  }}</code></pre>
        <pre class="language-json">Disclosure Date To<code>{{ disclosureDateTo  }}</code></pre>
        <pre class="language-json">Legal identifier<code>{{ legalIdentifier  }}</code></pre>
        <pre class="language-json">Financial year<code>{{ financialYear  }}</code></pre>
        <pre class="language-json">Title: <code>{{ title  }}</code></pre>
      </div>
  </div>
  
</template>

<script>
import Vue from 'vue';
import Config from "@/config.js";
import Utils from "@/js/utils.js";
import HeaderEFTG from "@/components/HeaderEFTG";
import Multiselect from 'vue-multiselect';
import SearchVuetable from './SearchVuetable';
import FieldDefs from './SearchFieldDefs.js';

Vue.component('search-vuetable', SearchVuetable);


export default {
  name: "SearchPage",
  data() {
    return {
      fields: FieldDefs,
      sortOrder: [
        {
          field: 'email',
          sortField: 'email',
          direction: 'asc'
        }
      ],
      moreParams: {},
      issuerName: [{ id: "1", name: "Google S.A." }],
      optionsIssuerName: [{
          id: "1",
          name: "Google S.A."
        }, {
          id: "2",
          name: "Facebook S.A."
        }
      ],
      disclosureDateFrom: null,
      disclosureDateTo: null,
      homeMemberState: [{id: "RO", name: "Romania"}],
      optionsHomeMemberState: [{
          id: "RO",
          name: "Romania"
        }, {
          id: "SP",
          name: "Spain"
        }
      ],
      legalIdentifier: [{id: "4000302021", name: "4000302021"}],
      optionsLegalIdentifier: [{
          id: "4000302021RO",
          name: "4000302021"
        }, {
          id: "815600828773",
          name: "815600828773"
        }
      ],
      financialYear : [{id: "2018"}],
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
      docClass: [{id: "1", name: "Periodic Regulated Information"}],
      optionsDocClass: [
        {
          id: "1",
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
      title: ""
    };
  },
  components: {
    HeaderEFTG, Multiselect, SearchVuetable
  },
  mounted() {
    
  },
  methods: {
    addTag (newTag) {
      console.log(newTag);
      const tag = {
        name: newTag,
        id: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
      this.optionsHomeMemberState.push(tag)
    },
    submit() {
        console.log("json_metadata");
        console.log(json_metadata);
    },
    clear() {
      this.homeMemberState = [];
    },
    onAction (action, data, index) {
      console.log('slot action: ' + action, data.name, index)
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

.eftg-pdf-preview {
  height: 350px;
  padding: 5px;
  text-align: center;
  background-color: #ccc;
  border: 1px solid #aaa;
}

.eftg-btn-primary {
  background-color: #0F5494;
}

.eftg-btn-secondary {
  background-color:#C3C3C3; 
}
</style>

