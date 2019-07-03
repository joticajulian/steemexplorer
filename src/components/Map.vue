<template>
  <div>
    <div class="row">
      <div :class="{'col-md-6':showBlocks,'col-12':!showBlocks}">
        <h2 v-if="showTitles">Witnesses Monitor Map</h2>
        <div id="map" class="fixed-height"></div>
        <div class="last-witness">
          <div v-if="showLegend && lastBlocks.length > 0">
            <div><img :src="icon.green" width="10px" class="mr-2"/>Current Witness: <router-link :to="'/explorer/@'+current_witness.witness">{{current_witness.visible_name}}</router-link> {{current_location}}</div>
            <!--<div><img :src="icon.blue"   width="10px" class="mr-2"/>witness online</div>-->
            <div><img :src="icon.yellow" width="10px" class="mr-2"/>witness online</div>
            <div><img :src="icon.red" width="10px" class="mr-2"/>witness offline</div>
          </div>
        </div>
      </div>
      <div v-if="showBlocks" class="col-md-6 fixed-height">
        <div v-if="showTitles" style="text-align: end; padding-top: 4px;"><h3>Last validated blocks</h3></div>
        <div v-if="lastBlocks.length > 0">
          <div class="last-blocks">
            <transition-group name="list-blocks" tag="div">
              <div v-for="(b) in lastBlocks" :key="b.block_num" class="list-blocks-item">
                <div class="block-left">
                  <router-link :to="EXPLORER+'b/'+b.block_num">{{b.block_num}}</router-link>
                  <span v-if="b.loaded">
                    - {{b.size_txs}} transactions
                    <span v-if="b.size_posts>0">
                      ({{b.size_posts}} posts)
                    </span>
                  </span>
                  <span v-else>
                    loading...
                  </span>
                </div
                ><div class="block-right">
                  <span class="small">witness</span><br><router-link :to="EXPLORER+'@'+b.witness">{{b.witness_visible_name}}</router-link>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
        <div v-else>
          <div class="loader"></div>
        </div>
        <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
        <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
        <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import SteemClient from '@/mixins/SteemClient.js'

// Leaflet library for OpenStreetMap
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import greenIconUrl from '@/assets/green-circle.png'
import redIconUrl from '@/assets/red-circle.png'
import blueIconUrl from '@/assets/blue-circle.png'
import yellowIconUrl from '@/assets/yellow-circle.png'

// Axios import for HTTP requests
import axios from 'axios';

/* Seed Nodes
 * This json contains a list of locations of witnesses given the seed nodes of them
 * We used ipstack to get this information. For instance, for seed.therealwolf.me:2001
 *   http://api.ipstack.com/seed.therealwolf.me?access_key=9a13e6f55b6be2f2bca42764a1269cd4
 */
import seednodes from '@/assets/seednodes.json';

export default {
  name: 'Map',

  props: {
    showBlocks: {
      type: Boolean,
      default: true
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showTitles: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      witnesses: [],
      map: {},
      ints: {},
      lastBlocks:[],
      schedule:[],
      last_block_num: 0,
      last_witness: '',
      current_location: '',
      current_witness: {
        witnesss: '',
        visible_name: ''
      },    
      first_time: true,
      icon: {
        green: greenIconUrl,
        blue:  blueIconUrl,
        red:   redIconUrl,
        yellow:yellowIconUrl
      },
      wait_more_time: false,
      EXPLORER: Config.EXPLORER
    }
  },
  
  mixins: [
    SteemClient
  ],

  created() {
    let self = this
    //this.client.database.getDynamicGlobalProperties().then(function(result){
    this.steem_database_call('get_dynamic_global_properties').then(function(result){
      self.last_block_num = result.head_block_number;
      self.first_time = false;
    })      
  },
  
  mounted() {
    this.initMap()
  },
  
  beforeDestroy() {
    clearInterval(this.ints.blocks)
  },

  methods: {
    initMap() {
      this.fetchWitnesses()
      .catch(function(error){
        console.log('Error in fetchWitnesses')
        console.log(error)
      })

      this.ints.blocks = setInterval(this.fetchBlocks, 3000);
    },
  
    getIndexOffset(wit, status) {
      var zIndex = 0
      switch(status){
        case 'offline':
          zIndex = 0
          break
        case 'online':
          zIndex = 500          
          break
        case 'live':
          zIndex = 1000
          break
        default:
          break
      }
      return zIndex
    },
    
    getIcon(wit, status) {
      var size = [12, 12]      
            
      var url = redIconUrl
      
      switch(status){
        case 'offline':
          url = redIconUrl
          break
        case 'online':
          url = yellowIconUrl
          break
        case 'live':
          url = greenIconUrl
          break
        default:
          break
      }
      var LeafIcon = L.Icon.extend({
        options: {
          iconSize: size      
        }
      })
      return new LeafIcon({iconUrl:  url})
    },
    
    /* This method prints the map and add the witnesses to it taking 
     * into account seednodes.json and the locations stored in the blockchain
     */
    async fetchWitnesses() {
      let self = this;
            
      // Set the map and initial view
      this.map = L.map('map').setView(Config.MAP.INI_POS, Config.MAP.INI_ZOOM); //([30, 0], 1); // latitude 30, longitude 0. Zoom 1
      
      /* Tiles for the map:
       *   Normal view: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
       *   Black map:   https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png
       */
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    
      // Taking the data from assets/seednodes.json
      this.witnesses = seednodes.slice()
      this.witnesses.forEach(function(wit){
        wit.visible_name = wit.owner
        var redIcon = self.getIcon(wit.owner, 'offline')
        
        if(wit.latlong[0] != null && wit.latlong[1] != null){
          var zIndex = self.getIndexOffset(wit.owner, 'offline')
          wit.marker = L.marker(wit.latlong, {icon: redIcon, zIndexOffset:zIndex }).bindPopup(wit.owner).addTo(self.map);          
        }else{
          wit.marker = null;
        }        
      });      
      
      // Taking the data from the blockchain (location stored in metadata)      
      //var result = await this.client.database.call('get_witnesses_by_vote', ['',Config.MAP.TOP_WITNESSES]);
      var result = await this.steem_database_call('get_witnesses_by_vote', ['',Config.MAP.TOP_WITNESSES])

      var names = [];

      // add new data to witnesses
      result.forEach(function(wit){
        names.push(wit.owner);
        
        var status = 'online';
        if(wit.signing_key == Config.STEEM_ADDRESS_PREFIX + '1111111111111111111111111111111114T1Anm'){
          status = 'offline';
          console.log('@'+wit.owner+' is offline');
        }else{
          console.log('@'+wit.owner+' is online');
        }
        
        var id = self.witnesses.findIndex(function(w){ return w.owner == wit.owner; });
        if(id >= 0) {
          self.witnesses[id].id = wit.id; //TODO: no reactive. Consider using self.$set(self.witnesses, id, new_val)
          self.witnesses[id].location = '';
          self.witnesses[id].status = status;
        } else {
          self.witnesses.push({
            owner: wit.owner,
            visible_name: wit.owner,
            status: status,
            latlong: [null, null],
            location: '',
          });
        }
      })
      
      this.addWitnessesToMap(names);
    },
    
    /* This method adds new accounts to the witness list, gets the location 
     * stored in the blockchain and calls 'loadLocation' to add it to the map
     */
    async addWitnessesToMap(names){
      
      let self = this
    
      //var result = await this.client.database.call('get_accounts', [names]);
      var result = await this.steem_database_call('get_accounts', [names])
      
      result.forEach(function(account){        
        var metadata;
        var location = '';
        try{
          metadata = JSON.parse(account.json_metadata);
          if(metadata && metadata.profile && metadata.profile.location){
            location = metadata.profile.location;
          }
        }catch(e){
          metadata = null;
        }  
        var id = self.witnesses.findIndex(function(w){ return w.owner == account.name; });
        if(id >= 0) {
          self.witnesses[id].location = location; //TODO: no reactive          
        } else {
          self.witnesses.push({
            owner: account.name,
            visible_name: account.name,
            status: 'online', //if it is producing blocks there is no need to check the signing key, he is online
            latlong: [null, null],
            location: location,
          });
          id = self.witnesses.length - 1;          
        }
        
        self.loadLocation(id)        
      });      
    },
    
    /* This method queries NOMATIM, a service to search locations
     * and uses the response to put a marker in the map
     */
    async loadLocation(id){
    
      var wit = this.witnesses[id];
      
      // case when there is no location
      if(wit.location == ''){
        if(wit.latlong[0] == null || wit.latlong[1] == null){
          console.log('@'+wit.owner+' does not have a location');
        }else{
          console.log('@'+wit.owner+' location taken from seed node')
        }
        return;
      }      
      
      /* searching on nominatim.openstreetmap latitude and longitude for the location
       * Format of searching: 
       *   https://nominatim.openstreetmap.org/search?q=luxembourg&format=json&limit=1
       */
      var searchParams = new URLSearchParams();
      searchParams.append('format','json');
      searchParams.append('limit','1');
      searchParams.append('q', wit.location);
      let nomiQuery = 'https://nominatim.openstreetmap.org/search?' + searchParams.toString();
                 
      var response = await axios.get(nomiQuery);
        
      if(response.data.length == 0){
        console.log('There is no response for location: "'+wit.location+'". (@'+wit.owner+')');
        return;
      }  
      
      let point = response.data[0];
      if( point.lat!=null && point.lon!=null && 
        (point.type == 'city' || point.type == 'country' || point.type == 'island' || point.type == 'administrative')
      ){
        /* It corresponds to a valid location, then latitude and longitude are stored 
         * In order to avoid 2 witnesses in the same point (they are in the same city) we add a random number
         */
        wit.latlong = [parseFloat(point.lat)+Math.random()*0.1-0.05, parseFloat(point.lon)+Math.random()*0.1-0.05]
          
        var icon = this.getIcon(wit.owner,wit.status)
                  
        wit.visible_name = wit.owner
        var zIndex = this.getIndexOffset(wit.owner, wit.status)
        wit.marker = L.marker(wit.latlong, {icon: icon, zIndexOffset:zIndex}).bindPopup(wit.visible_name).addTo(this.map);        
      } else if(wit.marker && wit.marker!= null) {
        console.log('The site "'+wit.location+'" is not a valid location. (@'+wit.owner+'). Point taken from seednodes');
      } else {
        wit.marker = null;
        console.log('The site "'+wit.location+'" is not a valid location. (@'+wit.owner+')');  
      }
    },

    updateBlockVisibleName(wit) {
      var id = this.lastBlocks.findIndex(function(b){return b.witness === wit.owner })
      if(id >= 0) this.$set(this.lastBlocks[id],'witness_visible_name', wit.visible_name)
      if(id == 0) this.current_witness.visible_name = wit.visible_name
    },
  
    /* fetchBlocks gets the last 5 blocks and looks 
     * who is the witness to show it in the map
     */
    fetchBlocks() {
      if(this.last_block_num == 0) return;
      if(this.wait_more_time) {
        this.wait_more_time = false
        return
      }

      var SIZE_BLOCKS = 5;
      var last_block_recorded = {}
      if(this.lastBlocks.length > 0){
        last_block_recorded = this.lastBlocks[0];          
      }else{
        last_block_recorded = {
          block_num : this.last_block_num - SIZE_BLOCKS,
          timestamp_milis : (new Date()).getTime(),
          time_ago: '',
          loaded: false,
        }
      }

      var n = this.last_block_num - last_block_recorded.block_num;
      var newBlocks = [];
      for(var i=1;i<=n;i++) newBlocks.push(this.last_block_num - n + i);
      this.last_block_num++;
            
      let self = this;
      newBlocks.forEach(function(num){
        var b = {
          block_num : num,
          timestamp_milis : last_block_recorded.timestamp_milis + (num-last_block_recorded.block_num)*3000,
          time_ago: '',
          size_txs: 0,
          size_posts: 0,
          witness: '',
          loaded: false,
        };
          
        self.lastBlocks.unshift(b);
        if(self.lastBlocks.length > SIZE_BLOCKS) self.lastBlocks.pop();
        
        self.getBlock(b)
      }) 
    },

    getBlock(b) {
      let self = this
      this.steem_database_call('get_block',[b.block_num]).then(function(resultBlock){
        if(!resultBlock) { //Block still does not exist.
          self.wait_more_time = true
          console.log('Block does not exist yet. Waiting 3 seconds')
          setTimeout( ()=>{ self.getBlock(b) }, 3000)
          return
        }

        b.size_txs = resultBlock.transactions.length;
        b.size_posts = resultBlock.transactions.filter(
          function(tx){
            return tx.operations[0][0]=='comment' && tx.operations[0][1].parent_author=='';
        }).length;
        b.timestamp_milis = (new Date(resultBlock.timestamp+'Z')).getTime();
  
        b.witness = resultBlock.witness;
        var id = self.witnesses.findIndex(function(wit){return wit.owner == b.witness});
        if(id >= 0) b.witness_visible_name = self.witnesses[id].visible_name;
        else b.witness_visible_name = b.witness
        b.loaded = true;
      
        // calculate the position and update the front-end (lastBlocks)
        var pos = self.lastBlocks.findIndex(function(blk){return blk.block_num == b.block_num});
        if(pos >= 0){
        
          self.$set(self.lastBlocks, pos, b);      
        
          if(pos == 0){
            if(b.witness == self.schedule[0]) self.schedule.shift()
      
            //search the previous witness to change the color to blue
            id = self.witnesses.findIndex(function(wit){return wit.owner == self.last_witness});
            if(id >= 0) self.setMarkerColor(id, 'online')
    
            //print green the actual witness
            var aliasText = ''; 
            if(b.witness !== b.witness_visible_name) aliasText = ' (alias @'+b.witness_visible_name+')'
            console.log('Block '+b.block_num+ ' by @'+b.witness+ aliasText);
            self.current_witness.visible_name = b.witness_visible_name;
            self.current_witness.witness = b.witness;
            
            id = self.witnesses.findIndex(function(wit){return wit.owner == b.witness});
            if(id >= 0){
              self.setMarkerColor(id, 'live')
              self.last_witness = b.witness;        
            }else{
              console.log('Witness @'+b.witness+' is not in the list. Adding him to the map');
              // self.current_location = '(Unknown location)';
              self.addWitnessesToMap([b.witness])
            }
          }
        }
      }).catch(function(error){
        console.log(error)
      })
    },

    // Change the color of a marker in the map
    setMarkerColor(id, status){
      var icon = this.getIcon(this.witnesses[id].owner, status)
      if(this.witnesses[id].marker != null) {
        var zIndex = this.getIndexOffset( this.witnesses[id].owner , status )
        this.witnesses[id].marker.setIcon(icon);
        this.witnesses[id].marker.setZIndexOffset(zIndex)
        this.current_location = '';
      } else {
        console.log('@'+this.witnesses[id].owner+' does not have a marker')
        this.current_location = '(Unknown location)';
      }
    },
    
    zoomUpdate (zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate (center) {
      this.currentCenter = center;
    },
    showLongText () {
      this.showParagraph = !this.showParagraph;
    },
    popupClick () {
      alert('Popup Click!');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.map{
  display: block;
  margin: 15px 50px;  
}

#map {
  width: 100%;
}

.fixed-height {
  height: 350px;
}

.last-blocks{
  width: 100%;
  display: inline-block;
  vertical-align: top;
}

.block-left{
  display: inline-block;
  margin: auto 0px;
  width: 70%;
}

.block-right{
  display: inline-block;
  width: 30%;
  margin: auto 0px;
  text-align: right;
}

.block-group{
  height: 51rem;
}

.list-blocks-item {
  transition: all 3s;
  border: solid 1px #dcdcdc;
  border-radius: 5px;
  margin: 10px auto;
  padding: 8px 10px;
  display: block;
  background-color: white;
  height: 4rem;
}

.list-blocks-enter, .list-blocks-leave-to{
  opacity: 0;  
}

@media only screen and (min-width: 768px) {
  .map{
    display: inline-block;
    vertical-align: top;
    width: 50%;
    margin: 15px 10px 15px 50px;    
  }

  .info-block{
    display: inline-block;
    vertical-align: top;
    width: calc(100% - 50% - 120px);
    margin: 15px 50px 15px 10px;
  }
}

</style>
