<script>
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

Vue.use(VueEvents);
Vue.component('custom-actions', CustomActions);
Vue.component('filter-bar', FilterBar);

export default {
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationInfo
  },
  props: {
    apiUrl: {
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
    formatDate (value, fmt = 'DD/MM/YYYY') {
      return (value == null)
        ? ''
        : moment(value, 'YYYY-MM-DD').format(fmt)
    },
    refresh(searchInputData) {
      const vuetableDataData = [];
      if(searchInputData['legalIdentifier'].length > 0) {
        for (var i = 0; i < this.vuetableData.data.length; i++) {
          if (this.vuetableData.data[i].identifier_value === searchInputData['legalIdentifier'][0].identifier_value) {
            vuetableDataData.push(this.vuetableData.data[i]);
          }
        }
      }
      const vuetableData = JSON.parse(JSON.stringify(this.vuetableData));
      vuetableData.data = vuetableDataData;
      this.$refs.vuetable.setData(vuetableData);
    },
    onLoadSuccess(data, searchInputData = null) {
      const ignoreList = ['Bogdan', 'Bogdan1'];
      const appVersions = ['pulsar/0.0.1', 'sendjs/0.0.1'];
      const self = this;
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
      const url ='https://api.blkcc.xyz/pulsar/?q=identifier_value:*';
      axios.get(url).then(function(result) {
        result.data.hits.hits.forEach((item) => {
          if(appVersions.indexOf(item._source.app) !== -1 && ignoreList.indexOf(item._source.issuer_name) === -1) {
            const itemData = item._source;
            itemData.issuer_name_identifier = item._source.issuer_name + '<br/>' + item._source.identifier_value;
            searchResultData.push(itemData);
          }
        });
        
        for (var i = 0; i < searchResultData.length; i++) {
          if (distinct.indexOf(searchResultData[i].identifier_value) === -1) {
            distinct.push(searchResultData[i].identifier_value);
            vuetableData.data.push(searchResultData[i]);
          }
        }
        vuetableData.links.pagination.total = searchResultData.length;
        vuetableData.links.pagination.to = searchResultData.length;
        self.$refs.vuetable.setData(vuetableData);
        self.vuetableData = vuetableData;
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
