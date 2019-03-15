import { Client } from 'eftg-dsteem'
import Config from '@/config.js'

export default {
  
  data: function(){
    return {
      alert: {
        success: false,
        danger: false,
        info: false,
        successText: '',
        dangerText: '',
        infoText: ''
      },
      sending: false,
      aborting: false,
      onNodeProgress: null,
      abortNodeConnection: false
    }
  },
  
  created() {
    let self = this
    this.onNodeProgress = {
      abort() {
        if(self.abortNodeConnection) {
          console.log('Connection with the RPC node was aborted')
          return true
        }
        return false
      },
      onInit() {
        self.abortNodeConnection = false
      },
      onFail(event) {
        var number = event.fails>1 ? ' ('+event.fails+')' : ''
        self.showInfo('Connection problems. Trying to reconnect'+number+'...')
      },
      onChangeNode(event) {
        self.showInfo('Changing to node '+event.rpc_node)
      },
      onFailRound(event) {
        var number = event.failRounds>1 ? ' ('+event.failRounds+')' : ''
        self.showInfo('Connection problems with all RPC nodes. Trying again'+number+'...')
      },
      onSuccess(response) {
        self.hideInfo()
      },
      onError(error) {
        self.hideInfo()
        self.showDanger(error.message)
      },
      onAbort(event) {
        self.hideInfo()
        self.aborting = false
      }
    }
  },
  
  methods: {
    RPCnode_initClient(address = this.$store.state.rpc_node) {
      let opts = {}
      opts.addressPrefix = Config.STEEM_ADDRESS_PREFIX
      opts.timeout = Config.DSTEEM_TIMEOUT
      if(process.env.VUE_APP_CHAIN_ID) opts.chainId = process.env.VUE_APP_CHAIN_ID
      return new Client(address, opts)
    },

    RPCnode_setMaxFails(max_fails) {
      this.$store.state.max_fails = max_fails
    },

    RPCnode_setMaxFailRounds(max_fail_rounds) {
      this.$store.state.max_fail_rounds = max_fail_rounds
    },

    RPCnode_fail(event) {
      console.log('Fail RPC node')
      event.status = 'fail'
      event.fails++      
      if(event.fails >= this.$store.state.max_fails) {
        //change node        
        var id = Config.RPC_NODES.findIndex( (rpc)=> {return rpc === event.rpc_node} ) + 1
        
        event.status = 'change_node'
        
        if(id == Config.RPC_NODES.length){
          //all nodes failed. fail_rounds++
          console.log('Fail round RPC node')
          event.status = 'fail_round'
          id = 0

          event.fail_rounds++
          if(event.fail_rounds >= this.$store.state.max_fail_rounds) {
            //all nodes failed in all rounds. Error 
            var error = new Error('Connection error with the RPC node')
            error.name = 'RPCFailRounds'
            throw error
          }
        }
        event.rpc_node = Config.RPC_NODES[id]
        event.fails = 0
        console.log('Changing to node '+event.rpc_node)
      }
      return event
    },

    async RPCnode_request( request, lambda ) {
  
      if(lambda.onInit) lambda.onInit()

      var event = {
        status:          'init',
        rpc_node:        this.$store.state.rpc_node,
        fails:           0,
        fail_rounds:     0,
        max_fails:       this.$store.state.max_fails,
        max_fail_rounds: this.$store.state.max_fail_rounds,
      }
      var lastStableRPC = this.$store.state.rpc_node

      while(true) {
        try{
          if(lambda.abort && lambda.abort()) break

          var client = this.RPCnode_initClient(event.rpc_node)
          if(lastStableRPC !== this.$store.state.rpc_node){
            lastStableRPC = this.$store.state.rpc_node
            client = this.RPCnode_initClient(lastStableRPC)
            console.log('Taking a stable RPC node: '+lastStableRPC)
          }

          var response = await request(client)

          this.$store.state.rpc_node = event.rpc_node 

          if(lambda.onSuccess) lambda.onSuccess(response)
          return response
        }catch(error){
          if(error.name === 'RPCError') {
            if(lambda && lambda.onError) lambda.onError(error)
            throw error
          }

          try {
            event = this.RPCnode_fail(event) //this function could throw an error to break the while loop
          } catch(err) {
            if(lambda && lambda.onError) lambda.onError(err)
            throw err
          }

          if(lambda.onFail       && event.status === 'fail'       ) lambda.onFail(event)
          if(lambda.onChangeNode && event.status === 'change_node') lambda.onChangeNode(event) 
          if(lambda.onFailRound  && event.status === 'fail_round' ) lambda.onFailRound(event)
        }
      }

      if(lambda.onAbort) lambda.onAbort(event)
      var error = new Error('Connection aborted')
      error.name = 'Abort'
      throw error
    },

    async steem_database_call( method, params ) {
      return this.RPCnode_request( async function(client){
        return await client.database.call(method, params)
      }, this.onNodeProgress)
    },

    async steem_broadcast_comment( comment, privKey, lambda ) {
      return this.RPCnode_request( async function(client){
        return await client.broadcast.comment(comment, privKey)
      }, this.onNodeProgress)
    },

    async steem_broadcast_sendOperations( operations,privKey, lambda ) {
      return this.RPCnode_request( async function(client){
        return await client.broadcast.sendOperations(operations, privKey)
      }, this.onNodeProgress)
    },

    showInfo(msg){
      this.alert.info = true
      this.alert.infoText = msg
    },

    hideInfo(){
      this.alert.info = false
      this.alert.infoText = ''
    },

    showSuccess(msg) {
      this.alert.success = true
      this.alert.successText = msg
    },

    hideSuccess() {
      this.alert.success = false
      this.alert.successText = ''
    },

    showDanger(msg) {
      this.alert.danger = true
      this.alert.dangerText = msg
    },

    hideDanger() {
      this.alert.danger = false
      this.alert.dangerText = ''
    }
  }
}
