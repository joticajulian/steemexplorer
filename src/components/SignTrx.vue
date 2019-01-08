<template>
  <div>
    <div class="container">    
      <form>
        <div class="form-group">
          <label for="textareaTrx">Transaction</label>
          <textarea class="form-control" id="textareaTrx" rows="7" v-model="inputTrx"></textarea>
        </div>
        <div v-if="needHeaders" class="form-group">
          <button class="btn bth-primary col-12 col-md-2" @click="addHeaders">Add Headers</button>
        </div>
        <div class="form-group">
          <label for="password" class="col-12 col-md-2">Private key</label>
          <input text="password" id="password" placeholder="key or wif" class="col-12 col-md-8" v-model="password"/>
          <button class="btn bth-primary col-12 col-md-2" @click="sign">Sign</button>
        </div>
      </form>
      <div class="row">
       <div v-if="alert.success" class="alert alert-success col-12">{{alertMsg.success}}</div>
       <div v-if="alert.danger" class="alert alert-danger col-12">{{alertMsg.danger}}</div>
      </div>      
    </div>        
  </div>
</template>

<script>
import debounce from "lodash.debounce";
import axios from "axios";
import Crypto from "crypto";

import Config from "@/config.js";
import Utils from "@/js/utils.js";

export default {
  name: "SignTrx",
  
  data() {
    return {
      inputTrx: '',
      password: '',
      needHeaders: false,
      
      alert: {
        success: false,
        danger: false,
      },
      alertMsg: {
        success: '',
        danger: '',
      },
    };
  },
  
  created() {
    this.debounced_validateTrx = debounce(this.validateTrx, 300);
    
    // test - delete    
    var head_block_number = 29135172; 
    var head_block_id = "01bc914470166bb1e3b822849a0a8a895aa2bebc"     
    var prefix = Buffer.from(head_block_id, 'hex')
    console.log(prefix)
    var prefix2 = prefix.readUInt32LE(4);
    console.log("prefix2: "+prefix2);
    // end test    
  },
  
  mounted() {
    this.startEventListenerFile();
  },
  
  watch: {
    inputTrx: function() {
      this.debounced_validateTrx();
    }    
  },
  methods: {
    sign () {
      var trx
      console.log('input trx:')
      console.log(this.inputTrx)
      
      try {
        trx = JSON.parse(this.inputTrx)
        console.log(trx)
      } catch (error) {
        console.log(error)
        return
      }
      
      try {
        var privKey = dsteem.PrivateKey.fromString(this.password);
      } catch (error) {
        console.log('incorrect format privkey')
        console.log(error)
        return
      }
    
      var client = new dsteem.Client('http://api.steemit.com');
      var sgnTrx = client.broadcast.sign(trx , privKey);
      console.log(sgnTrx)
      
      this.inputTrx = JSON.stringify(sgnTrx)
    },
    
    async addHeaders () {
      //op = ['nothing',{}];
      /*op = ["escrow_transfer",
        {
	       from: 'jga',
	       to: 'nextvote',
	       sbd_amount: "0.000 SBD",
	       steem_amount: "1.000 STEEM",
	       escrow_id: 1,
	       agent: "steem",
	       fee: "0.100 STEEM",
	       json_meta: JSON.stringify(json_metadata),
	       ratification_deadline: ratification_deadline,
	       escrow_expiration: escrow_expiration
        }
      ];*/
    
      var op
      try {
        op = JSON.parse(this.inputTrx)
        console.log(op)
      } catch (error) {
        console.log(error)
        return
      }
      
      var client = new dsteem.Client('http://api.steemit.com');
      
      const dgp = await client.database.getDynamicGlobalProperties();
      console.log(dgp);
      
      var head_block_number = dgp.head_block_number;
      var head_block_id = dgp.head_block_id;
      var prefix = Buffer.from(head_block_id, 'hex').readUInt32LE(4);
         
      var expireTime = 3590;
      var expiration = new Date(Date.now() + expireTime).toISOString().slice(0, -5)
      
      var trx = {
        ref_block_num: head_block_number,
        ref_block_prefix: prefix,
        expiration: expiration,
        operations: [op],
        extensions: []            
      }
      
      this.inputTrx = JSON.stringify(trx)
    },
    
    validateTrx () {
      var jsonTrx
      console.log('input trx:')
      console.log(this.inputTrx)
      
      try {
        jsonTrx = JSON.parse(this.inputTrx)
        console.log(jsonTrx)
      } catch (error) {
        console.log(error)
        return
      }
      
      if(jsonTrx.isArray && (typeof jsonTrx[0] === 'string' || jsonTrx[0] instanceof String)){
        //is an Operation
        this.needHeaders = true;
        return
      }
      
      if(jsonTrx.ref_block_num && jsonTrx.ref_block_prefix &&
        jsonTrx.expiration && jsonTrx.operations && jsonTrx.extensions
      )
      {
        // is a Transaction
        this.needHeaders = false;
        return    
      }
      console.log('incorrect format trx')
      this.needHeaders = true;
    },
    
    startEventListenerFile() {
      /*var input = document.getElementById("inputFile");
      var label = input.nextElementSibling,
        labelVal = label.innerHTML;

      input.addEventListener("change", function(e) {
        var fileName = e.target.value.split("\\").pop();
        if (fileName) label.innerHTML = fileName;
        else label.innerHTML = labelVal;
      });*/
    },

    //Definition of the function to read a file using Promises (better for using await)
    //More info: https://blog.shovonhasan.com/using-promises-with-filereader/
    async readFileAsBuffer(inputFile) {
      /*const reader = new FileReader();

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
      });*/
    },
    
    showAlert(success, message){
      if(success) {
        this.alert.success = true;
        this.alertText.success = message;
        
        this.alert.danger = false;
        this.alertText.danger = '';
      }else{
        this.alert.success = false;
        this.alertText.success = '';
        
        this.alert.danger = true;
        this.alertText.danger = message;
      }
    },    
  }
};
</script>

<style scoped>

</style>
