import { Client } from 'eftg-dsteem'
import Config from '@/config.js'

export default {
  
  data: function(){
    return {
      client: null
    }
  },
  
  created() {
    this.RPCnode_initClient()
  },
  
  methods: {
    RPCnode_initClient() {
      let opts = {}
      opts.addressPrefix = Config.STEEM_ADDRESS_PREFIX
      opts.timeout = Config.DSTEEM_TIMEOUT
      if(process.env.VUE_APP_CHAIN_ID) opts.chainId = process.env.VUE_APP_CHAIN_ID
      this.client = new Client(this.$store.state.rpc_node.current, opts)
    },

    RPCnode_setMaxFails(max_fails) {
      this.$store.state.rpc_node.max_fails = max_fails
    },

    RPCnode_setMaxFailRounds(max_fail_rounds) {
      this.$store.state.rpc_node.max_fail_rounds = max_fail_rounds
    },

    RPCnode_restartFails() {
      this.$store.state.rpc_node.fails = 0
    },

    RPCnode_restartFailRounds() {
      this.$store.state.rpc_node.fail_rounds = 0
    },

    RPCnode_fail() {
      console.log('Fail RPC node')
      this.$store.state.rpc_node.fails++
      if(this.$store.state.rpc_node.fails >= this.$store.state.rpc_node.max_fails) 
        this.RPCnode_changeNode()
    },

    RPCnode_failRound() {
      console.log('Fail round RPC node')
      this.$store.state.rpc_node.fail_rounds++
      if(this.$store.state.rpc_node.fail_rounds >= this.$store.state.rpc_node.max_fail_rounds) { 
        var error = new Error('Connection error with the RPC node')
        error.name = 'RPCError'
        throw error
      }
    },

    RPCnode_changeNode() {
      var id = this.$store.state.rpc_node.current_id + 1

      if(id == Config.RPC_NODES.length){
        id = 0
        this.RPCnode_failRound()
      }
      this.$store.state.rpc_node.current_id = id
      this.$store.state.rpc_node.current    = Config.RPC_NODES[id]
      console.log('Changing to node '+Config.RPC_NODES[id])
      this.RPCnode_initClient()
      this.RPCnode_restartFails()
    },

    async RPCnode_request( request ) {
      var i=1
      while(true) {
        try{
          var response = await request()
          return response
        }catch(error){
          console.log(error)
          if(error.name === 'RPCError') throw new Error(error)
          this.RPCnode_fail() //this function could throw an error to break the while loop
        }
        i++
      }
    },

    async steem_database_call( method, params ) {
      let self = this
      return this.RPCnode_request( async function(){
        return await self.client.database.call(method, params)
      })
    },

    async steem_broadcast_comment( comment, privKey ) {
      let self = this
      return this.RPCnode_request( async function(){
        return await self.client.broadcast.comment(comment, privKey)
      })
    },

    async steem_broadcast_sendOperations( operations,privKey ) {
      let self = this
      return this.RPCnode_request( async function(){
        return await self.client.broadcast.sendOperations(operations, privKey)
      })
    }
  }
}
