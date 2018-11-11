<template>
  <div class="map">
    <!--<l-map
      :zoom="zoom"
      :center="center"
      style="height: 80%"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate">
      <l-tile-layer
        :url="url"
        :attribution="attribution"/>
      <l-marker :lat-lng="marker"></l-marker>        
    </l-map>-->
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet';
//import 'leaflet.icon.glyph';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import greenIconUrl from '@/assets/green-circle.png'
import redIconUrl from '@/assets/red-circle.png'
import blueIconUrl from '@/assets/blue-circle.png'

import axios from 'axios';
import seednodes from '@/assets/seednodes.json';

/*delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')   
});*/

export default {
  name: 'Map',
  data () {
    return {
      zoom: 13,
      center: L.latLng(49.8158683, 6.1296751),
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(49.8158683, 6.1296751),
      currentZoom: 11.5,
      currentCenter: L.latLng(49.8158683, 6.1296751),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      },
      witnesses: [],
      map: {},
    }
  },
  
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  
  mounted() {
    this.fetchData()
  },  

  methods: {
  
    //https://nominatim.openstreetmap.org/search?q=luxembourg&format=json&limit=1
    //http://api.ipstack.com/seed.therealwolf.me?access_key=9a13e6f55b6be2f2bca42764a1269cd4
    
    fetchData() {
      this.witnesses = [];
      let self = this;
      
      self.map = L.map('map').setView([51.5, -0.09], 13);
      //https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png
      //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
	  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	  }).addTo(self.map);
      
      seednodes.forEach(function(n){
        

        var LeafIcon = L.Icon.extend({
		  options: {
		    iconSize:     [20, 20],
		    shadowSize:   [0, 0],
		    iconAnchor:   [20, 20],
		    shadowAnchor: [0, 0],
		    popupAnchor:  [-10, -25]
		  }
	    });
        var blueIcon = new LeafIcon({iconUrl: blueIconUrl})
        if(n.latlong[0] != null && n.latlong[1] != null){
          L.marker(n.latlong, {icon: blueIcon}).bindPopup(n.owner).addTo(self.map);
        }

        
      });
      
      
      steem.api.getWitnessesByVote('',50, function(err, result){
        if (err || !result) {
          //not a witness
          return;
        }
        self.witnesses = result;
        
        var names = [];
        for(var id in result){
          //console.log(witness);
          names.push(result[id].owner);
          self.witnesses[id].location = '';
        }
        
        steem.api.getAccounts(names, function(err, result2){
          if (err || !result) {
            console.log("error loading witness accounts, try again");
          }
          for(var id in result2){
            var metadata;
            var account = result2[id];
            try{
              metadata = JSON.parse(account.json_metadata);
            }catch(e){
              metadata = null;
            }  
            if(metadata && metadata.profile && metadata.profile.location){
              self.witnesses[id].location = metadata.profile.location;
            }
          }

          self.witnesses.forEach(function(witness){
            if(witness.location != ''){          
              //look address in map
              var searchParams = new URLSearchParams();
              searchParams.append('format','json');
              searchParams.append('limit','1');
              searchParams.append('q', witness.location);
              let nomiQuery = 'https://nominatim.openstreetmap.org/search?' + searchParams.toString();
              
              /*axios.get(nomiQuery)
              .then(response => {
                if(response.data.length > 0){
                  let point = response.data[0];
                  if(point.type == 'city' || point.type == 'country' || point.type == 'island' || point.type == 'administrative'){
                    witness.latlong = [parseFloat(point.lat)+Math.random()*0.01-0.005, parseFloat(point.lon)+Math.random()*0.01-0.005]
                    
                    var LeafIcon = L.Icon.extend({
		              options: {
			            iconSize:     [20, 20],
			            shadowSize:   [0, 0],
			            iconAnchor:   [20, 20],
			            shadowAnchor: [0, 0],
			            popupAnchor:  [-10, -25]
		              }
	                });
                    var redIcon = new LeafIcon({iconUrl: redIconUrl})
                    L.marker(witness.latlong, {icon: redIcon}).bindPopup(witness.owner).addTo(self.map);
                    console.log('witness:'+witness.owner+'. location:'+witness.location+'. CORRECT type: '+point.type);
                  }else{
                    console.log('witness:'+witness.owner+'. location:'+witness.location+'. bad type: '+point.type);
                    //console.log(point);
                  }
                }else{
                  console.log('response of '+witness.owner+' is empty');
                }
              })
              .catch(error => {
                console.log(error);
              })*/
              
              
              
            }else{
              console.log(account.name + ': NO LOCATION');
            }
          });
        });      
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


.map{
  height: 500px;
}

#map {
			width: 600px;
			height: 400px;
		}

</style>
