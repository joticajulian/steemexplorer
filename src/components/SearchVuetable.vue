<script>
import Config from "@/config.js";
import axios from "axios";
import accounting from 'accounting';
import moment from 'moment';
import Vue from 'vue';
import VueEvents from 'vue-events';
import Vuetable from 'vuetable-2/src/components/Vuetable';
import VuetablePagination from 'vuetable-2/src/components/VuetablePagination';
import VuetablePaginationInfo from 'vuetable-2/src/components/VuetablePaginationInfo';
import CustomActions from './SearchCustomActions';
import FilterBar from './SearchFilterBar';
import Dictionary from "@/mixins/Dictionary.js";

Vue.use(VueEvents);
Vue.component('custom-actions', CustomActions);
Vue.component('filter-bar', FilterBar);

export default {
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationInfo
  },
  mixins: [
    Dictionary
  ],
  props: {
    apiUrl: {
      type: String,
      required: true
    },
    elasticApiUrl: {
      type: String,
      required: true
    },
    fields: {
      type: Array,
      required: true
    },
    sortOrder: {
      type: Array,
      default() {
        return []
      }
    },
    appendParams: {
      type: Object,
      default() {
        return {}
      }
    },
    detailRowComponent: {
      type: String
    }
  },
  data () {
    return {
      vuetableData: null
    }
  },
  mounted () {
    this.$events.$on('filter-set', eventData => this.onFilterSet(eventData))
    this.$events.$on('filter-reset', e => this.onFilterReset())
  },
  render(h) {
    return h(
      'div',
      {
        class: { ui: true, container: true }
      },
      [
        h('filter-bar'),
        this.renderVuetable(h),
        this.renderPagination(h)
      ]
    )
  },
  methods: {
    // render related functions
    renderVuetable(h) {
      return h(
        'vuetable',
        {
          ref: 'vuetable',
          props: {
            apiUrl: this.apiUrl,
            fields: this.fields,
            paginationPath: "",
            perPage: 10,
            multiSort: true,
            sortOrder: this.sortOrder,
            appendParams: this.appendParams,
            detailRowComponent: this.detailRowComponent,
          },
          on: {
            'vuetable:cell-clicked': this.onCellClicked,
            'vuetable:pagination-data': this.onPaginationData,
            'vuetable:load-success': this.onLoadSuccess
          },
          scopedSlots: this.$vnode.data.scopedSlots
        }
      )
    },
    renderPagination(h) {
      return h(
        'div',
        { class: {'vuetable-pagination': true, 'ui': true, 'basic': true, 'segment': true, 'grid': true} },
        [
          h('vuetable-pagination-info', { ref: 'paginationInfo' }),
          h('vuetable-pagination', {
            ref: 'pagination',
            on: {
              'vuetable-pagination:change-page': this.onChangePage
            }
          })
        ]
      )
    },
    // ------------------
    allcap (value) {
      return value.toUpperCase()
    },
    formatNumber (value) {
      return accounting.formatNumber(value, 2)
    },
    formatBoolean (value) {
      return value ? 'Yes' : 'No';
    },
    formatDate (value, fmt = 'DD/MM/YYYY') {
      return (value == null)
        ? ''
        : moment(value, 'YYYY-MM-DD').format(fmt)
    },
    refresh(searchInputData = null) {
      if(searchInputData === null) {
        if(this.searchInputData !== undefined) {
          searchInputData = this.searchInputData;
        }
      }
      const vuetableData = JSON.parse(JSON.stringify(this.vuetableData));
      const dictionary = this.dictionary;
      let initialData = this.vuetableData.data;
      let finalData = initialData;
      let distinct = [];
      if(searchInputData !== null && searchInputData['legalIdentifier'] !== undefined && searchInputData['legalIdentifier'].length > 0) {
        finalData = [];
        for (var i = 0; i < initialData.length; i++) {
          const id = initialData[i]._id;
          const value = initialData[i].identifier_value;
          searchInputData['legalIdentifier'].forEach(inputValue => {
            if (value === inputValue.identifier_value) {
              if (distinct.indexOf(id) === -1) {
                distinct.push(id);
                finalData.push(initialData[i]);
              }
            }
          });
        }
        initialData = finalData;
        distinct = [];
      }

      if(searchInputData !== null && searchInputData['issuerName'] !== undefined && searchInputData['issuerName'].length > 0) {
        finalData = [];
        for (var i = 0; i < initialData.length; i++) {
          const id = initialData[i]._id;
          const value = initialData[i].issuer_name;
          searchInputData['issuerName'].forEach(inputValue => {
            if (value === inputValue.name) {
              if (distinct.indexOf(id) === -1) {
                distinct.push(id);
                finalData.push(initialData[i]);
              }
            }
          });
        }
        initialData = finalData;
        distinct = [];
      }

      if(searchInputData !== null && searchInputData['homeMemberState'] !== undefined && searchInputData['homeMemberState'].length > 0) {
        finalData = [];
        for (var i = 0; i < initialData.length; i++) {
          const id = initialData[i]._id;
          const value = initialData[i].home_member_state;
          searchInputData['homeMemberState'].forEach(inputValue => {
            if (value === inputValue.code) {
              if (distinct.indexOf(id) === -1) {
                distinct.push(id);
                finalData.push(initialData[i]);
              }
            }
          });
        }
        initialData = finalData;
        distinct = [];
      }

      if(searchInputData !== null && searchInputData['subclass'] !== undefined  && searchInputData['subclass'].length > 0) {
        const subclasses = [];
        searchInputData['subclass'].forEach(inputValue => {
          subclasses.push(inputValue);
          for(var ii=0; ii < dictionary.docClasses.length; ii++){
            var c = dictionary.docClasses[ii];
            if(c.id === inputValue.id) {
              for(var jj=0; jj < c.subclass.length; jj++){
                subclasses.push(c.subclass[jj]);
              }
            }
          }
        });
        finalData = [];
        for (var i = 0; i < initialData.length; i++) {
          const id = initialData[i]._id;
          const value = initialData[i].subclass;
          subclasses.forEach(inputValue => {
            if (value === inputValue.id) {
              if (distinct.indexOf(id) === -1) {
                distinct.push(id);
                finalData.push(initialData[i]);
              }
            }
          });
        }
        initialData = finalData;
        distinct = [];
      }

      if(searchInputData !== null && searchInputData['financialYear'] !== undefined  && searchInputData['financialYear'].length > 0) {
        finalData = [];
        for (var i = 0; i < initialData.length; i++) {
          const id = initialData[i]._id;
          const value = initialData[i].financial_year;
          searchInputData['financialYear'].forEach(inputValue => {
            if (value === inputValue.id) {
              if (distinct.indexOf(id) === -1) {
                distinct.push(id);
                finalData.push(initialData[i]);
              }
            }
          });
        }
        initialData = finalData;
        distinct = [];
      }

      if(searchInputData !== null && searchInputData['title'] !== undefined  && searchInputData['title'].length > 0) {
        finalData = [];
        for (var i = 0; i < initialData.length; i++) {
          const id = initialData[i]._id;
          const value = initialData[i].comment;
          const inputValue = searchInputData['title'];
          if (value.indexOf(inputValue) !== -1) {
            if (distinct.indexOf(id) === -1) {
              distinct.push(id);
              finalData.push(initialData[i]);
            }
          }
        }
        initialData = finalData;
        distinct = [];
      }

      const sortField = this.sortOrder[0].sortField;
      const sortDirection = this.sortOrder[0].direction;
      finalData.sort((a, b) => {
        if(a[sortField] > b[sortField]) return sortDirection === 'desc' ? -1 : 1;
        else if(a.storage_date < b.storage_date) return sortDirection === 'desc' ? 1 : -1;
        else return 0;
      });

      vuetableData.data = finalData;
      this.$refs.vuetable.setData(vuetableData);
      this.searchInputData = searchInputData;
    },
    onLoadSuccess(data = null) {
      const self = this;
      const ignoreList = ['Bogdan', 'Bogdan1'];
      const appVersions = ['pulsar/0.0.1', 'pulsar/0.0.2', 'sendjs/0.0.1'];
      const distinct = [];
      const searchResultData = [];
      const vuetableData = {
        links: {
          pagination: {
            total: 0,
            per_page: 15,
            current_page: 1,
            last_page: 1,
            next_page_url: "https:\/\/cdn.blkcc.xyz\/search.json\/?page=2",
            prev_page_url: null,
            from: 1,
            to: 1,
          }
        },
        data: []
      };
      const dictionary = this.dictionary;
      const url = this.elasticApiUrl + '?pretty=true&size=100&q=*:*';
      axios.get(url).then(function(result) {
        result.data.hits.hits.forEach((item) => {
          if(appVersions.indexOf(item._source.app) !== -1 && ignoreList.indexOf(item._source.issuer_name) === -1) {
            const itemData = item._source;
            itemData._id = item._id;
            itemData.issuer_name_identifier = item._source.issuer_name + '<br/>' + item._source.identifier_value;
            itemData.document_url = '#';
            if(typeof item._source.link !== 'undefined') {
              itemData.document_url = item._source.link;
              itemData.revised = item._source.type_submission === 'revised' ? true : false;
              if(itemData.document_url.length > 0) {
                itemData.document_url = itemData.document_url.replace('[[pdf link]](', '');
                itemData.document_url = itemData.document_url.replace(')', '');
              }
            }
            itemData.subclass_label = itemData.subclass;
            if(typeof dictionary.docClassLabels[itemData.subclass + ""] !== 'undefined') {
              itemData.subclass_label = dictionary.docClassLabels[itemData.subclass + ""];
            }
            searchResultData.push(itemData);
          }
        });

        const sortField = self.sortOrder[0].sortField;
        const sortDirection = self.sortOrder[0].direction;
        searchResultData.sort((a, b) => {
          if(a[sortField] > b[sortField]) return sortDirection === 'desc' ? -1 : 1;
          else if(a.storage_date < b.storage_date) return sortDirection === 'desc' ? 1 : -1;
          else return 0;
        });

        for (var i = 0; i < searchResultData.length; i++) {
          if (distinct.indexOf(searchResultData[i].identifier_value) === -1) {
            vuetableData.data.push(searchResultData[i]);
          }
        }

        vuetableData.links.pagination.total = searchResultData.length;
        vuetableData.links.pagination.to = searchResultData.length;
        self.$refs.vuetable.setData(vuetableData);
        self.$refs.pagination.setPaginationData(vuetableData.links.pagination);
        self.$refs.paginationInfo.setPaginationData(vuetableData.links.pagination);
        self.vuetableData = vuetableData;

        self.refresh();
      }).catch(function(error){
        console.log(error);
      });
    },
    onPaginationData (paginationData) {
      this.$refs.pagination.setPaginationData(paginationData)
      this.$refs.paginationInfo.setPaginationData(paginationData)
    },
    onChangePage (page) {
      this.$refs.vuetable.changePage(page)
    },
    onCellClicked (data, field, event) {
      console.log('cellClicked: ', field.name)
      this.$refs.vuetable.toggleDetailRow(data.id)
    },
    onFilterSet (filterText) {
      this.appendParams.filter = filterText
      Vue.nextTick( () => this.$refs.vuetable.refresh() )
    },
    onFilterReset () {
      delete this.appendParams.filter
      Vue.nextTick( () => this.$refs.vuetable.refresh() )
    }
  }
}
</script>
