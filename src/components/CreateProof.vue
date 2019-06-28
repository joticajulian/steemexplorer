<template>
  <div>
        <div class="form-group row">
          <label for="input_message" class="col-md-2 col-form-label">RECEIVER</label>
          <div class="col-md-10">
            <input class="form-control" type="text" id="input_message"
              v-model="message" placeholder="Receiver name"/>
          </div>
        </div>
        <div class="form-group row">
          <label for="input_expiration_date" class="col-md-2 col-form-label">EXPIRATION</label>
          <div class="col-md-10">
            <select class="form-control" v-model="expiration">
              <option v-for="(opt,key) in expiration_options" :value="opt.value">{{opt.text}}</option>
            </select>
          </div>
        </div>

        <div class="row mt-4">
          <div class="form-group col-12 align-bottom" style="padding-top: 8px;">
            <button @click="create_proof" class="btn btn-primary btn-large mr-2" :disabled="sending"><div v-if="sending" class="mini loader"></div>Create proof</button>
          </div>
        </div>
        <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
        <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
        <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { saveAs } from 'file-saver'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import Alerts from '@/mixins/Alerts'

export default {
  name: 'CreateProof',

  props: {
    badge: Object
  },

  data() {
    return {
      message: '',
      expiration: 24*60*60*1000,

      expiration_options: [
        {value:          15*60*1000, text:'15 minutes'},
        {value:          60*60*1000, text:'1 hour'},
        {value:       24*60*60*1000, text:'1 day'},
        {value:     2*24*60*60*1000, text:'2 day'},
        {value:     7*24*60*60*1000, text:'1 week'},
        {value:    30*24*60*60*1000, text:'1 month'},
        {value: 365/2*24*60*60*1000, text:'6 months'},
        {value:   365*24*60*60*1000, text:'1 year'}
      ],

      sending: false,
      EXPLORER: Config.EXPLORER,
    }
  },

  mixins: [
    Alerts
  ],

  methods: {
    async create_proof() {
      this.sending = true
      this.hideSuccess()
      this.hideDanger()

      try{
        var data = {
          badge_url: '@' + this.badge.issuer + '/' + this.badge.permlink,
          message: this.message,
          expiration_date: new Date(Date.now() + parseInt(this.expiration)).toISOString().slice(0, -5)
        }
        console.log(JSON.stringify(data))
        var response = await axios.post(Config.SERVER_API + "create_proof", data)
        var presentation = response.data
        var blob = new Blob([JSON.stringify(presentation)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "proof.json");

        this.showSuccess('Proof created')
      }catch(error){
        console.log(error)
        this.showDanger(error.message)
      }

      this.sending = false
      this.hideInfo()
    }
  }
}

</script>
