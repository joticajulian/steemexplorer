<template>
  <div>
    <b-modal ref="modalSignature" hide-footer title="Signature">
      <div v-if="signatures.length>0">
        <label class="col-form-label">Signature</label>
        <div class="hash">{{signatures[sigSelected].signature}}</div>
        <label class="col-form-label">Public key</label>
        <div class="hash">{{signatures[sigSelected].public_key}}</div>
        <label class="col-form-label mt-3">Signed by</label>
        <div v-if="signatures[sigSelected].signed_by !== ''">@{{signatures[sigSelected].signed_by}}</div>
        <div v-else>Unknown account</div>
        <label class="col-form-label mt-3">Authorities</label>
        <div v-if="signatures[sigSelected].authorities.length > 0" class="mb-3">
          <span v-for="auth in signatures[sigSelected].authorities">{{auth}}. </span>
        </div>
        <div v-else class="mb-3">Unknown</div>
        <button class="btn btn-primary mr-3" @click="hideModalSignature">close</button>
        <button class="btn btn-secondary" @click="removeSignature">remove</button>
      </div>
      <div v-else>
        No signatures
      </div>
    </b-modal>


    <b-modal ref="modalImport" hide-footer title="Import transaction">
      <textarea class="form-control" v-model="trx_import" rows="10"/>
      <button class="btn btn-primary mt-3 mb-3" @click="do_import">import</button>
      <div v-if="alertImport.danger"  class="alert alert-danger" role="alert">{{alertImport.dangerText}}</div>
    </b-modal>


    <b-modal ref="modalExport" hide-footer title="Export transaction">
      <textarea class="form-control" v-model="trx_export" rows="10" disabled/>
      <button class="btn btn-primary mt-3" @click="copy_trx">copy</button>
    </b-modal>


    <b-modal ref="modalOptionalFields" hide-footer title="Optional fields">
      <div v-for="(pname,index) in operationModalOptionalFields.optional" :key="index" class="row mb-3">
        <input class="form-control col-1 offset-1" type="checkbox" v-model="operationModalOptionalFields.params[pname].use_it"/>
        <label class="col-form-label col-10">{{pname}}</label>
      </div>
      <button class="btn btn-primary mt-3 mb-3" @click="hideModalOptionalFields">close</button>
    </b-modal>


    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <div class="row mb-3">
        <h2 class="col-6">Broadcast</h2>
        <div class="col">
          <div class="text-right">
            <button class="btn btn-primary" @click="showModalImport">import</button>
          </div>
        </div>
      </div>
      <div v-if="signatures.length==0">
        <div class="form-group row mt-3">
          <label class="col-md-9 col-sm-6 col-form-label text-right">Expiration</label>
          <div class="col-md-3 col-sm-6">
            <select class="form-control" v-model="expireTime">
              <option v-for="(opt,key) in expiration_options" :value="opt.value">{{opt.text}}</option>
            </select>
          </div>
        </div>
      </div>
      <div v-else>
        <label class="col-form-label col-12 text-right" :class="{'text-danger':hasExpired}">{{leftTime}}</label>
        <label class="col-form-label col-12 text-right">{{leftTime2}}</label>
      </div>
      <div v-for="(operation, opIndex) in trx" :key="opIndex" class="card border-dark mb-5">
        <div class="card-header">{{operation.name}}</div>
        <div class="card-body">
          <div class="mb-3 text-break">{{operation.description}}</div>
          <div v-if="operation.optional.length>0" class="row mb-2">
            <div class="col text-right">
              <button class="btn btn-secondary" @click="showModalOptionalFields(opIndex)" :disabled="signatures.length>0">Optional fields</button>
            </div>
          </div>
          <div v-for="(param,pname,pindex) in operation.params" :key="pindex">
            <div v-if="param.use_it" class="form-group row">
              <label class="col-md-2 col-form-label">{{param.name}}</label>
              <div v-if="param.typeUI==='textarea'" class="col">
                <textarea class="form-control"
                  v-model="param.value" :rows="param.rows" :disabled="signatures.length>0"/>
              </div>
              <div v-else-if="param.typeUI==='text'" class="col">
                <input class="form-control" type="text"
                  v-model="param.value" :placeholder="param.placeholder" :disabled="signatures.length>0"/>
              </div>
              <div v-else-if="param.typeUI==='checkbox'" class="col">
                <input class="form-control" type="checkbox"
                  v-model="param.value" :placeholder="param.placeholder" :disabled="signatures.length>0"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-5">
        <div class="col-md-8">
          <select v-model="operation_selected" class="form-control">
            <option v-for="(operation, name, index) in operations" :key="index" :value="name">{{operation.name}}</option>
          </select>
        </div>
        <div class="col-md-4">
          <button class="btn btn-primary" @click="addOperation(operation_selected)">Add operation</button>
        </div>
      </div>
      <div class="mt-5 mb-2">
        <h4 class="d-inline mr-2">Signatures</h4>
        <button class="btn btn-secondary" @click="reloadSignatures"><font-awesome-icon icon="sync"/></button>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="card mb-2">
            <ul class="list-group list-group-flush">
              <li v-for="(sig,index) in signatures" :key="index" class="list-group-item" @click="selectSignature(index)">
                <div class="image-profile mr-2" :style="{ backgroundImage: 'url(' + sig.image + ')' }"></div><span>{{sig.display}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="form-group row mt-3">
        <label class="col-md-2 col-form-label">Signature</label>
        <input class="col-md-9 form-control" type="text" v-model="signature" placeholder="Signature"/>
        <div class="col-md-1">
          <button class="btn btn-primary" @click="addSignature(signature)">Add</button>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-md-2 col-form-label">Private Key</label>
        <input class="col-md-9 form-control" type="password" v-model="privkey" placeholder="Private key"/>
        <div class="col-md-1">
          <button class="btn btn-primary" @click="sign(false)">Sign</button>
        </div>
      </div>
      <div class="form-group mt-3 mb-4">
        <button class="btn btn-primary btn-large mr-2" @click="broadcast" :disabled="sending"><div v-if="sending" class="mini loader"/>broadcast</button>
        <button class="btn btn-secondary" @click="do_export">export</button>
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>    
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'
import SteemClient from '@/mixins/SteemClient.js'
import { Client, PrivateKey, cryptoUtils, Signature, utils } from 'dsteem'
import steemjs from 'steem'
import * as sereyjs from '@sereynetwork/sereyjs';
import Alerts from '@/mixins/Alerts.js'
import Utils from '@/js/utils.js'

import Config from '@/config.js'
import Operations from '@/js/operations.js'
import ChainProperties from '@/mixins/ChainProperties.js'


export default {
  name: 'RewardCalcPage',
  
  data() {
    return {
      operations: Operations,
      opSelected: 'comment',
      operation_selected: '',
      signature: '',
      privkey: '',
      headers: null,
      headersAux: null,
      expireTime: 60*60*1000,
      leftTime: '',
      leftTime2: '',
      hasExpired: false,
      trx: [],
      signatures: [],
      sigSelected: 0,
      
      sending: false,
      EXPLORER: Config.EXPLORER,
      EXPLORER2: Config.EXPLORER2,

      trx_import: '',
      trx_export: '',
      alertImport: {
        danger: false,
        textDanger: ''
      },
      alertExport: {
        danger: false,
        textDanger: ''
      },
      expiration_options: [
        {value:       1*60*1000, text:'1 minute'},
        {value:      10*60*1000, text:'10 minutes'},
        {value:      30*60*1000, text:'30 minutes'},
        {value:      60*60*1000, text:'1 hour'},
        {value:    8*60*60*1000, text:'8 hours'},
        {value:   24*60*60*1000, text:'1 day'},
        {value: 3*24*60*60*1000, text:'3 days'},
      ],
      operationModalOptionalFields: {}
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    ChainProperties,
    SteemClient,
    Alerts
  ],

  created() {
    this.getChainProperties()
    this.operations = Operations
    setInterval( ()=>{
      if(!this.headers) return
      var diff = new Date(this.headers.expiration+'Z') - Date.now()
      if(diff > 0){
        this.hasExpired = false
        this.leftTime = `Expires in ${Utils.textTime(diff)}`
        if(diff <= 60*60*1000){
          this.leftTime2 = ''
        }else{
          var timeToBroadcast = new Date(new Date(this.headers.expiration+'Z').getTime() - 60*60*1000).toISOString().slice(0,-5)
          this.leftTime2 = `It can only be broadcasted with one hour to expire, that is, after ${timeToBroadcast} UTC`
        }
      }else{
        this.leftTime = 'Transaction expired'
        this.leftTime2 = ''
        this.hasExpired = true
      }
    },1000)
    this.addHeaders() //used to sign offline
    setInterval( ()=>{this.addHeaders()} , 60000)
  },

  watch: {
    
  },

  methods: {
    selectOperation(name){
      this.trx[0] = JSON.parse(JSON.stringify(this.operations[name]))
      this.signatures = []
    },

    selectSignature(index){
      this.sigSelected = index
      this.$refs.modalSignature.show()
    },

    hideModalSignature(){
      this.$refs.modalSignature.hide()
    },

    showModalImport(){
      this.$refs.modalImport.show()
    },

    showModalExport(){
      this.$refs.modalExport.show()
    },

    showModalOptionalFields(index){
      this.operationModalOptionalFields = this.trx[index]
      this.$refs.modalOptionalFields.show()
    },

    hideModalOptionalFields(){
      this.$refs.modalOptionalFields.hide()
    },

    addOperation(op_selected){
      var newOperation = JSON.parse(JSON.stringify( this.operations[ op_selected ] ))
      this.$set(this.trx, this.trx.length, newOperation)
    },

    removeSignature(){
      this.signatures.splice( this.sigSelected , 1 )
      this.sigSelected = 0
      this.$refs.modalSignature.hide()
    },

    async reloadSignatures(){
      var signatures = this.signatures
      this.signatures = []
      for(var i in signatures){
        this.addSignature( signatures[i].signature )
      }
    },

    async addSignature(sig){
      this.hideSuccess()
      this.hideDanger()
      try{
        if(!this.headers) throw new Error('No headers defined')
        var trx = this.buildTransaction()
        trx.signatures = [sig]
        var keys = this.getSignatureKeys(trx)
        var display = keys[0]
        var signed_by = ''
        var authorities = []
        var image = ''
        var account = await this.searchAccountKey(keys[0])
        if(account && account.name){
          signed_by = account.name
          image = account.image
          display = '@' + signed_by
          if(account.authorities){
            authorities = account.authorities
            for(var i in authorities){
              display = display + ' ' + authorities[i]
            }
          }
        }

        var item = {
          signature: sig,
          public_key: keys[0],
          display,
          signed_by,
          authorities,
          image
        }
        this.signatures.push(item)
      }catch(error){
        this.showDanger(error.message)
        throw error
      }
    },

    async searchAccountKey(key){
      key = key.toString()
      var account = {
        name: null,
        authorities: [],
        image: ''
      }
      try{
        if(!navigator.onLine)
          return account
        var accounts = await this.steem_database_call('get_key_references',[[key]])
        if(!accounts || accounts.length == 0){
          console.log('No keys found')
          return null
        }
        console.log('Found accounts:')
        console.log(accounts)
        account.name = accounts[0][0]
        accounts = await this.steem_database_call('get_accounts',[[account.name]])
        if(!accounts || accounts.length == 0) return account
        var roles = ['owner','active','posting']
        for(var i in roles){
          var role = roles[i]
          accounts[0][role].key_auths.forEach( (k)=>{
            if(key === k[0]) account.authorities.push(role)
          })
        }
        if(account.authorities.length > 0 && accounts[0].json_metadata && accounts[0].json_metadata.length > 0){
          var metadata = JSON.parse(accounts[0].json_metadata)
          account.image = Utils.getProfileImage(metadata)
        }
      }catch(error){
        console.log(error)
      }
      return account
    },

    buildTransaction(){
      var operations = []
      for(var i in this.trx){
        var op = this.trx[i]
        if( op.operation.includes('steem_engine_') ){
          var operation = this.buildOperationSteemEngine(op)
        }else{
          var operation = [ op.operation, {} ]
          for(var key in op.params){
            var param = op.params[key]
            if(param.use_it)
              operation[1][key] = this.paramParse(param.value, param.type)
          }

          // special case for witness_set_properties
          if( op.operation === 'witness_set_properties' )
            operation = utils.buildWitnessUpdateOp( operation[1].owner , operation[1].props )
        }
        operations.push(operation)
      }

      var trx = {
        ref_block_num: this.headers ? this.headers.ref_block_num : 0,
        ref_block_prefix: this.headers ? this.headers.ref_block_prefix : 0,
        expiration: this.headers ? this.headers.expiration : new Date(Date.now() + parseInt(this.expireTime)).toISOString().slice(0, -5),
        operations: operations,
        extensions: [],
        signatures: []
      }

      return trx
    },

    buildOperationSteemEngine(op){
      var contractPayload = {}
      for(var key in op.params){
        if(key === '_account') continue
        var param = op.params[key]
        contractPayload[key] = this.paramParse(param.value, param.type)
      }
      var json = {
        contractName: op.contract,
        contractAction: op.action,
        contractPayload
      }
      var operation = [
        'custom_json',
        {
          required_auths: [op.params._account.value],
          required_posting_auths: [],
          id: 'ssc-mainnet1',
          json: JSON.stringify(json)
        }
      ]
      return operation
    },

    paramParse(value, type){
      switch(type){
        case 'asset':
        case 'account':
        case 'string':
        case 'public_key':
        case 'time':
        case 'textarea':
          return value

        case 'boolean':
          return (typeof value === 'string' && value === 'true') || (typeof value === 'boolean' && value)

        case 'buffer':
          return Buffer.from(value)

        case 'number':
          return parseInt(value)

        case 'float-string':
          if(isNaN(value)) throw new Error('Incorrect amount')
          return value

        case 'json':
          try{
            JSON.parse(value)
          }catch(error){
            throw new Error('Invalid json format')
          }
          return value // json data is written as string in the blockchain
        case 'object':
          try{
            return JSON.parse(value)
          }catch(error){
            throw new Error('Invalid json format')
          }
        default:
          throw new Error(`The param type ${type} is unknown`)
      }
    },

    paramParseInv(value, type){
      switch(type){
        case 'asset':
        case 'account':
        case 'string':
        case 'public_key':
        case 'time':
        case 'textarea':
          return value

        case 'boolean':
          return value ? 'true' : 'false'

        case 'buffer':
          return value //todo review

        case 'number':
          return value + ''

        case 'json':
          return value // json data is written as string in the blockchain
        case 'object':
          return JSON.stringify(value)
        default:
          throw new Error(`The param type ${type} is unknown`)
      }
    },

    sign(skip){
      try{
        console.log(skip)
        if(!skip && this.signatures.length==0){
          this.addHeaders().then( ()=>{this.sign(true)} )
          return
        }
        this.hideSuccess()
        this.hideDanger()

        var trx = this.buildTransaction()
        console.log(trx)

        var client = new Client('',{chainId:Config.STEEM_CHAIN_ID})
        try{
          var privkey = PrivateKey.fromString(this.privkey)
        }catch(error){
          throw new Error('Error reading the private key')
        }
        // var sgnTrx = client.broadcast.sign(trx, privkey)
        var sgnTrx = steemjs.auth.signTransaction(trx, [this.privkey])
        this.addSignature( sgnTrx.signatures[0] )
      }catch(error){
        this.showDanger(error.message)
        throw error
      }
    },

    async broadcast(){
      try{
        this.hideDanger()
        this.hideSuccess()
        this.sending = true
        if(this.signatures.length == 0)
          throw new Error('Please sign the transaction')

        var trx = this.buildTransaction()
        this.signatures.forEach( (sig)=>{
          trx.signatures.push(sig.signature)
        })
        var result = await this.steem_broadcast_send(trx)
        this.showSuccess(`<a href="${this.EXPLORER2}b/${result.block_num}/${result.id}">Transaction sent successfully</a>`)
        console.log(trx)
        this.sending = false
      }catch(error){
        this.showDanger(error.message)
        this.sending = false
        throw error
      }
    },

    async addHeaders(where = 'principal'){
      if(this.signatures.length > 0) return
      if(navigator.onLine){
        var dgp = await this.steem_database_call('get_dynamic_global_properties')

        var ref_block_num = dgp.head_block_number & 0xFFFF;
        var ref_block_prefix = Buffer.from(dgp.head_block_id, 'hex').readUInt32LE(4);
        var expiration = new Date(new Date(dgp.time + 'Z').getTime() + parseInt(this.expireTime)).toISOString().slice(0, -5)
      }else{
        if(where==='principal' && !this.headersAux)
          throw new Error('Please connect to internet to get headers before signing offline')
        var ref_block_num = this.headersAux.ref_block_num
        var ref_block_prefix = this.headersAux.ref_block_prefix
        var expiration = new Date(Date.now() + parseInt(this.expireTime)).toISOString().slice(0, -5) 
      }

      var headers = {
        ref_block_num,
        ref_block_prefix,
        expiration,
      }

      if(where !== 'aux'){
        if(dgp && dgp.time)
          console.log(`Blockchain time: ${dgp.time}`)
        console.log(`Headers: Expiration: ${expiration}`)

        this.headers = headers
      }
      this.headersAux = headers
    },

    getSignatureKeys(trx){
      var chainId = this.RPCnode_initClient().chainId
      var digest = cryptoUtils.transactionDigest(trx,chainId)
      var keys = []
      for(var i in trx.signatures){
        var sig = trx.signatures[i]
        keys.push(Signature.fromString(sig).recover(digest))
      }
      return keys
    },

    do_import(){
      try{
        this.alertImport.danger = false
        var trx = JSON.parse(this.trx_import)
        this.getSignatureKeys(trx)

        this.headers = {
          ref_block_num: trx.ref_block_num,
          ref_block_prefix: trx.ref_block_prefix,
          expiration: trx.expiration,
        }

        this.trx = []
        for(var i in trx.operations){
          var op_name = trx.operations[i][0]
          this.addOperation(op_name)
          var operation = this.trx[this.trx.length-1]
          for(var key in operation.params){
            var param = operation.params[key]
            if(typeof trx.operations[i][1][key] !== 'undefined'){
              param.use_it = true
              param.value = this.paramParseInv( trx.operations[i][1][key] , param.type )
            }else{
              param.use_it = false
            }
          }
        }

        this.signatures = []
        for(var i in trx.signatures){
          this.addSignature(trx.signatures[i])
        }

        this.$refs.modalImport.hide()

      }catch(error){
        this.alertImport.danger = true
        this.alertImport.dangerText = error.message
        throw error
      }
    },

    do_export(){
      try{
        this.hideDanger()
        this.hideSuccess()
        var trx = this.buildTransaction()
        this.signatures.forEach( (sig)=>{
          trx.signatures.push(sig.signature)
        })
        this.trx_export = JSON.stringify(trx,null,2)
        this.$refs.modalExport.show()
      }catch(error){
        this.showDanger(error.message)
        throw error
      }
    },

    copy_trx(){
      Utils.copyTextToClipboard(this.trx_export)
    },
  }
}
</script>

<style scoped>

.hash {
  font-family: monospace;
  //font-size: 1.3rem;
  overflow-wrap: break-word;
}

</style>
