import Config from "@/config.js";
import axios from "axios";

export default {
  data() {
    return {
      pulsarApi: {
        issuerNames: [],
        legalIdentifiers: [],
        error:{
          issuerNames: null,
          legalIdentifiers: null
        }
      }
    }
  },

  created() {
    const issuerNames = [];
    // const ignoreList = ['Bogdan', 'Bogdan1'];
    // const appVersions = ['pulsar/0.0.1', 'pulsar/0.0.2', 'sendjs/0.0.1'];
    const self = this;
    const url = Config.ELASTIC + '?pretty=true&size=10000&q=*:*';
    axios.get(url).then(function(result){
      result.data.hits.hits.forEach((item) => {
        if(/^(pulsar|sendjs)\/[0-9]\.[0-9]\.[0-9]$/.test(item._source.app)) {
          issuerNames.push({
            name: item._source.issuer_name
          });
        }
      });
      let distinct = [];
      for (var i = 0; i < issuerNames.length; i++) {
        if (distinct.indexOf(issuerNames[i].name) === -1) {
          distinct.push(issuerNames[i].name);
          self.pulsarApi.issuerNames.push(issuerNames[i]);
        }
      }
      self.pulsarApi.issuerNames.sort((a, b) => {
        if(a.name < b.name) return -1;
        else if(a.name > b.name) return 1;
        else return 0;
      });

      distinct = [];
      const identifiers = [];
      result.data.hits.hits.forEach((item) => {
        if(/^(pulsar|sendjs)\/[0-9]\.[0-9]\.[0-9]$/.test(item._source.app)) {
          identifiers.push({
            identifier_id: item._source.identifier_id,
            identifier_value: item._source.identifier_value
          });
        }
      });

      for (var i = 0; i < identifiers.length; i++) {
        if (distinct.indexOf(identifiers[i].identifier_value) === -1) {
          distinct.push(identifiers[i].identifier_value);
          self.pulsarApi.legalIdentifiers.push(identifiers[i]);
        }
      }
      self.pulsarApi.legalIdentifiers.sort((a, b) => {
        if(a.identifier_value < b.identifier_value) return -1;
        else if(a.identifier_value > b.identifier_value) return 1;
        else return 0;
      });
    }).catch(function(error){
      console.log(error);
      self.pulsarApi.error.issuerNames = error;
    });
  }
}
