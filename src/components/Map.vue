<template>
  <div>
    <div class="info0">
      <h1>Witnesses Monitor Map</h1>
    </div>
	<div class="map">
      <div id="map"></div>
	  <div class="last-witness">
	    <div v-if="lastBlocks.length > 0">
	      Current Witness: <a :href="'#/@'+current_witness">{{current_witness}}</a> {{current_location}}
		</div>
	  </div>
    </div
	><div class="info-block">
      <div v-if="lastBlocks.length > 0">
        <div class="last-blocks">
          <!--<h2>Blocks</h2>-->
          <transition-group name="list-blocks" tag="div" class="block-group">
            <div v-for="(b,key,index) in lastBlocks" :key="b.block_num" class="list-blocks-item">
              <div class="block-left">
                <a :href="'#/b/'+b.block_num">{{b.block_num}}</a>
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
                <span class="small">witness</span><br><a :href="'#/@'+b.witness">{{b.witness}}</a>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
      <div v-else>
        <div class="loader"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'

//Leaflet library for OpenStreetMap
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import greenIconUrl from '@/assets/green-circle.png'
import redIconUrl from '@/assets/red-circle.png'
import blueIconUrl from '@/assets/blue-circle.png'

//Axios import for HTTP requests
import axios from 'axios';

/* Seed Nodes
 * This json contains a list of locations of witnesses given the seed nodes of them
 * We used ipstack to get this information. For instance, for seed.therealwolf.me:2001
 *   http://api.ipstack.com/seed.therealwolf.me?access_key=9a13e6f55b6be2f2bca42764a1269cd4
 */
import seednodes from '@/assets/seednodes.json';

export default {
  name: 'Map',
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
      current_witness: '',	  
	  first_time: true,
    }
  },
  
  mounted() {
    this.fetchWitnesses()
	this.fetchState()
	this.ints.blocks = setInterval(this.fetchBlocks, 3000);
	this.ints.state  = setInterval(this.fetchState, 12000);
  },
  
  beforeDestroy() {
    clearInterval(this.ints.blocks);
    clearInterval(this.ints.state);
  },

  methods: {  
    
    //Change the color of a marker in the map
	setMarkerColor(id, color){
	  var LeafIcon = L.Icon.extend({options: {iconSize: [12, 12], } });
	  var icon = null;
	  var zIndex = 0;
	  switch(color){
	    case 'blue' : icon = new LeafIcon({iconUrl:  blueIconUrl}); 
		              zIndex = 500;
					  break;
		case 'red'  : icon = new LeafIcon({iconUrl:   redIconUrl});
		              zIndex = 0;
		              break;
		case 'green': icon = new LeafIcon({iconUrl: greenIconUrl});
		              zIndex = 1000;
                      break;					  
		default     : icon = new LeafIcon({iconUrl:   redIconUrl}); 
		              break;
	  }
	  if(this.witnesses[id].marker != null){
	    this.witnesses[id].marker.setIcon(icon);
		this.witnesses[id].marker.setZIndexOffset(zIndex);
		this.current_location = '';
      }else{
	    console.log('@'+this.witnesses[id].owner+' is '+color+', but he does not have a marker')
		this.current_location = '(Unknown location)';
	  }
	},
    
	/* This method prints the map and add the witnesses to it taking 
	 * into account seednodes.json and the locations stored in the blockchain
	 */
    fetchWitnesses() {
      let self = this;
            
      // Set the map and initial view
      this.map = L.map('map').setView(Config.MAP.INI_POS, Config.MAP.INI_ZOOM); //([30, 0], 1); // latitude 30, longitude 0. Zoom 1
      
	  /* Tiles for the map:
	   *   Normal view: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
	   *   Black map:   https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png
	   */
	  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	  }).addTo(self.map);
	  
	  //Taking the data from assets/seednodes.json
	  this.witnesses = seednodes;
      this.witnesses.forEach(function(wit){
        var LeafIcon = L.Icon.extend({ options: {iconSize: [12, 12],} });
        var redIcon = new LeafIcon({iconUrl: redIconUrl})
        if(wit.latlong[0] != null && wit.latlong[1] != null){
          wit.marker = L.marker(wit.latlong, {icon: redIcon}).bindPopup(wit.owner).addTo(self.map);
        }else{
		  wit.marker = null;
		}        
      });      
      
	  //Taking the data from the blockchain (location stored in metadata)
      steem.api.getWitnessesByVote('',Config.MAP.TOP_WITNESSES, function(err, result){
        if (err || !result) {
          console.log("error loading witnesses, try again");
          return;
        }
		
		var names = [];
		//add new data to witnesses
        result.forEach(function(wit){
		  names.push(wit.owner);
		  var id = self.witnesses.findIndex(function(w){ return w.owner == wit.owner; });
		  if(id >= 0){
		    self.witnesses[id].id = wit.id; //TODO: no reactive. Consider using self.$set(self.witnesses, id, new_val)
			self.witnesses[id].location = '';
		  }else{
		    self.witnesses.push({
			  owner: wit.owner,
			  status: 'offline',
			  latlong: [null, null],
			  location: '',
			});
		  }
		});
        
		//Get the account information where metadata is stored
		steem.api.getAccounts(names, function(err, result2){
          if (err || !result2) {
            console.log("error loading witness accounts, try again");
          }
		  
		  //look if there is a location in the metadata
          result2.forEach(function(account){		    
            var metadata;
            try{
              metadata = JSON.parse(account.json_metadata);
            }catch(e){
              metadata = null;
            }  
            var id = self.witnesses.findIndex(function(w){ return w.owner == account.name; });
		    if(metadata && metadata.profile && metadata.profile.location){
              self.witnesses[id].location = metadata.profile.location; //TODO: no reactive
            }
          });

          self.witnesses.forEach(function(wit){
		    if(wit.location != ''){
              /* searching on nominatim.openstreetmap latitude and longitude for the location
               * Format of searching: 
	  	       *   https://nominatim.openstreetmap.org/search?q=luxembourg&format=json&limit=1
		 	   */
              var searchParams = new URLSearchParams();
              searchParams.append('format','json');
              searchParams.append('limit','1');
              searchParams.append('q', wit.location);
              let nomiQuery = 'https://nominatim.openstreetmap.org/search?' + searchParams.toString();
                
              axios.get(nomiQuery)
              .then(response => {
                if(response.data.length > 0){
                  let point = response.data[0];
                  if( point.lat!=null && point.lon!=null && 
		  	        (point.type == 'city' || point.type == 'country' || point.type == 'island' || point.type == 'administrative')){
                    /* It corresponds to a valid location, then latitude and longitude are stored 
				     * In order to avoid 2 witnesses in the same point (they are in the same city) we add a random number
					 */
                    wit.latlong = [parseFloat(point.lat)+Math.random()*0.05-0.025, parseFloat(point.lon)+Math.random()*0.05-0.025]
				
         			var LeafIcon = L.Icon.extend({ options: {iconSize: [12, 12],} });
                    var redIcon = new LeafIcon({iconUrl: redIconUrl})
                    wit.marker = L.marker(wit.latlong, {icon: redIcon}).bindPopup(wit.owner).addTo(self.map);
                  }else if(wit.marker && wit.marker!= null){
				    console.log('The site "'+wit.location+'" is not a valid location. (@'+wit.owner+'). Point taken from seednodes');
		          }else{
                    wit.marker = null;
					console.log('The site "'+wit.location+'" is not a valid location. (@'+wit.owner+')');	
		          }
                }else{
                  console.log('There is no response for location: "'+wit.location+'". (@'+wit.owner+')');
                }
              })
              .catch(error => {
		        console.log(error);
              })
            }else{
			  if(wit.latlong[0] == null || wit.latlong[1] == null){
                console.log('@'+wit.owner+' does not have a location');
		      }else{
			    console.log('@'+wit.owner+' location taken from seed node')
			  }
            }			
          });
        });      
      });
	},
	
	/* fetchBlocks gets the last 10 blocks and looks 
	 * who is the witness to show it in the map
	 */
	fetchBlocks() {
	  if(this.last_block_num == 0) return;
	  
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
          
        steem.api.getBlock(num, function (err, resultBlock) {      
          if (err || !resultBlock) {
            console.log(err, resultBlock);             
            return;
          }
          b.size_txs = resultBlock.transactions.length;
          b.size_posts = resultBlock.transactions.filter(function(tx){
            return tx.operations[0][0]=='comment' && tx.operations[0][1].parent_author=='';
          }).length;
          b.timestamp_milis = (new Date(resultBlock.timestamp+'Z')).getTime();
          b.witness = resultBlock.witness;
          b.loaded = true;
          var pos = self.lastBlocks.findIndex(function(blk){return blk.block_num == num});
          if(pos >= 0){
            self.$set(self.lastBlocks, pos, b);			
            if(pos == 0){
              if(b.witness == self.schedule[0]) self.schedule.shift()
			  
			  //search the previous witness to change the color to blue
			  var id = self.witnesses.findIndex(function(wit){return wit.owner == self.last_witness});
			  if(id >= 0) self.setMarkerColor(id, 'blue')
			
              //print green the actual witness
              console.log('Block '+num+ ' by @'+b.witness);
			  self.current_witness = b.witness;
              
			  id = self.witnesses.findIndex(function(wit){return wit.owner == b.witness});
			  if(id >= 0){
			    self.setMarkerColor(id, 'green')
				self.last_witness = b.witness;				
			  }else{
			    console.log('Witness @'+b.witness+' is not in the list. Adding him to the map');
				self.current_location = '(Unknown location)';
				
				//Get the account information where metadata is stored
		        steem.api.getAccounts([b.witness], function(err, result){
                  if (err || !result || result.length==0) {
                    console.log('error loading witness @'+b.witness+' from the blockchain');
					return;
                  }
		  
		          //look if there is a location in the metadata
                  var account = result[0];
				  var location = '';
                  var metadata;
                  try{
                    metadata = JSON.parse(account.json_metadata);
					if(metadata && metadata.profile && metadata.profile.location){
                      location = metadata.profile.location;
                    }
                  }catch(e){
                    metadata = null;
                  }
                  	
                  self.witnesses.push({
			        owner: account.name,
			        status: 'offline',
			        latlong: [null, null],
			        location: location,
			      });
					
                  if(location != ''){
                    /* searching on nominatim.openstreetmap latitude and longitude for the location
                     * Format of searching: 
	  	             *   https://nominatim.openstreetmap.org/search?q=luxembourg&format=json&limit=1
		 	         */
                    var searchParams = new URLSearchParams();
                    searchParams.append('format','json');
                    searchParams.append('limit','1');
                    searchParams.append('q', location);
                    let nomiQuery = 'https://nominatim.openstreetmap.org/search?' + searchParams.toString();
                
                    axios.get(nomiQuery)
                    .then(response => {
                      if(response.data.length > 0){
                        let point = response.data[0];
						var id = self.witnesses.findIndex(function(wit){return wit.owner == account.name});                           
                        if( point.lat!=null && point.lon!=null && 
		  	              (point.type == 'city' || point.type == 'country' || point.type == 'island' || point.type == 'administrative')){
                            /* It corresponds to a valid location, then latitude and longitude are stored 
				             * In order to avoid 2 witnesses in the same point (they are in the same city) we add a random number
					         */
						   var latlong = [parseFloat(point.lat)+Math.random()*0.05-0.025, parseFloat(point.lon)+Math.random()*0.05-0.025]				
         			       var LeafIcon = L.Icon.extend({ options: {iconSize: [12, 12],} });
                           var greenIcon = new LeafIcon({iconUrl: greenIconUrl})
                           self.witnesses[id].marker = L.marker(latlong, {icon: greenIcon}).bindPopup(account.name).addTo(self.map);
						   self.last_witness = account.name;
						   console.log('@'+account.name+' added to the map. Location: '+location);						   
                        }else{
		                   self.witnesses[id].marker = null;
						   console.log('The site "'+location+'" is not a valid location. (@'+account.name+')');	
		                }
                      }else{
                        console.log('There is no response for location: "'+location+'". (@'+account.name+')');
                      }
                    })
                    .catch(error => {
		              console.log(error);
                    })
                  }else{
				    console.log('@'+account.name+' does not have a location');
		          }
                });				
			  }				   
			}
          }
        });  
      });       
    },
	
	/* fetchState gets the current round for witnesses, and add new witnesses to the
	 * list and map if necessary
	 */
	fetchState(){
	  let self = this;
	  
	  steem.api.getState('',function(err,result){
	    if (err || !result) {
          console.log(err, result);
          return;
        }
        
		//Get the last block number only one time.
		if(self.first_time) self.last_block_num = result.props.head_block_number;
        self.first_time = false; 
                
        // SCHEDULE
		if(self.schedule.length == 0){
          self.schedule = result.witness_schedule.current_shuffled_witnesses;
          return;
        }
        var current_witness = '';
        if(self.lastBlocks.length > 0) current_witness = self.lastBlocks[0].witness;
        var round = result.witness_schedule.current_shuffled_witnesses;
        var id = round.indexOf(current_witness);
        if(id == -1) return;
        for(var i=id+1;i<round.length;i++){
          self.$set(self.schedule, i-id-1, round[i]);
        }
        for(var i=0;i<id;i++){
          self.$set(self.schedule, round.length-id-1+i, round[i]);
        }
        self.$set(self.schedule, round.length-1, round[id]);
      });
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

.info-block{
  display: block;
  margin: 15px 50px;
}

.map{
  display: block;
  margin: 15px 50px;  
}

#map {
  width: 100%;
  height: 400px;
  margin: 10px auto;  
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
