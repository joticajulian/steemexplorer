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
      <div class="row">
        <div class="col-md-3">
          <div class="card mb-2">
            <ul class="list-group list-group-flush">
              <li v-for="(operation,name,index) in operations" :key="index" class="list-group-item" @click="selectOperation(name)">
                {{operation.name}}
              </li>
            </ul>
          </div>
        </div>
        <div class="col">
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
          </div>
          <h3 class="mb-2">{{trx.op0.name}}</h3>
          <div class="mb-3">{{trx.op0.description}}</div>
          <div v-for="(param,pname,pindex) in trx.op0.params" :key="pindex" class="form-group row">
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
          <h4 class="mt-5 mb-2">Signatures</h4>
          <div class="row">
            <div class="col-12">
              <div class="card mb-2">
                <ul class="list-group list-group-flush">
                  <li v-for="(sig,index) in signatures" :key="index" class="list-group-item" @click="selectSignature(index)">
                    {{sig.display}}
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
    </div>    
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'
import SteemClient from '@/mixins/SteemClient.js'
import { Client, PrivateKey, cryptoUtils, Signature, utils } from 'dsteem'
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
      signature: '',
      privkey: '',
      headers: null,
      expireTime: 60*60*1000,
      leftTime: '',
      hasExpired: false,
      trx: {
        op0: {}
      },
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
        {value:  1*60*1000, text:'1 minute'},
        {value: 10*60*1000, text:'10 minutes'},
        {value: 30*60*1000, text:'30 minutes'},
        {value: 60*60*1000, text:'1 hour'},
      ],
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
    this.selectOperation('comment')
    setInterval( ()=>{
      if(!this.headers) return
      var diff = new Date(this.headers.expiration+'Z') - Date.now()
      if(diff > 0){
        this.leftTime = 'Expires in ' + Utils.textTimeAgo(diff, '')
        this.hasExpired = false
      }else{
        this.leftTime = 'Transaction expired'
        this.hasExpired = true
      }
    },1000)
  },

  watch: {
    
  },

  methods: {
    selectOperation(name){
      this.trx.op0 = this.operations[name]
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

    removeSignature(){
      this.signatures.splice( this.sigSelected , 1 )
      this.sigSelected = 0
      this.$refs.modalSignature.hide()
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
        var account = await this.searchAccountKey(keys[0])
        if(account && account.name){
          signed_by = account.name
          display = '@' + signed_by
          if(account.authorities){
            authorities = account.authorities
            for(var i in authorities){
              display = display + ' ' + authorities[i]
            }
          }
        }
  
        this.signatures.push({
          signature: sig,
          public_key: keys[0],
          display,
          signed_by,
          authorities
        })
      }catch(error){
        this.showDanger(error.message)
        throw error
      }
    },

    async searchAccountKey(key){
      key = key.toString()
      var account = {
        name: null,
        authorities: []
      }
      try{
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
      }catch(error){
        console.log(error)
      }
      return account
    },

    buildTransaction(){
      if(!this.headers) throw new Error('no headers defined')
      var operation = [ this.trx.op0.operation, {} ]
      for(var key in this.trx.op0.params){
        var param = this.trx.op0.params[key]
        operation[1][key] = this.paramParse(param.value, param.type)
      }

      // special case for witness_set_properties
      if( this.trx.op0.operation === 'witness_set_properties' )
        operation = utils.buildWitnessUpdateOp( operation[1].owner , operation[1].props )

      var trx = {
        ref_block_num: this.headers.ref_block_num,
        ref_block_prefix: this.headers.ref_block_prefix,
        expiration: this.headers.expiration,
        operations: [operation],
        extensions: [],
        signatures: []
      }

      return trx
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
        if(!skip && (!this.headers || this.signatures.length==0)){
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
        var sgnTrx = client.broadcast.sign(trx, privkey)
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

    async addHeaders(){
      var dgp = await this.steem_database_call('get_dynamic_global_properties')

      var ref_block_num = dgp.head_block_number;
      var ref_block_prefix = Buffer.from(dgp.head_block_id, 'hex').readUInt32LE(4);
      var expiration = new Date(new Date(dgp.time + 'Z').getTime() + parseInt(this.expireTime)).toISOString().slice(0, -5)
      console.log(`Blockchain time: ${dgp.time}`)
      console.log(`Headers: Expiration: ${expiration}`)

      this.headers = {
        ref_block_num,
        ref_block_prefix,
        expiration,
      }
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
        if(trx.operations.length > 1)
          throw new Error('Transactions with more than one operation are not supported yet')

        this.headers = {
          ref_block_num: trx.ref_block_num,
          ref_block_prefix: trx.ref_block_prefix,
          expiration: trx.expiration,
        }

        var op_name = trx.operations[0][0]
        this.trx.op0 = this.operations[op_name]
        for(var key in this.trx.op0.params){
          var param = this.trx.op0.params[key]
          param.value = this.paramParseInv( trx.operations[0][1][key] , param.type )
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
