import {Client} from 'eftg-dsteem'
import Config from '@/config.js'

export default {
  /**
   * Defines a new transaction without operations
   */
  newTransaction: async function () {
    var client = new Client(Config.RPC_NODE.url)
      
    const dgp = await client.database.getDynamicGlobalProperties()
      
    var head_block_number = dgp.head_block_number;
    var head_block_id = dgp.head_block_id;
    var prefix = Buffer.from(head_block_id, 'hex').readUInt32LE(4);
         
    var expireTime = 60 * 1000;    
    var timezoneOffset = (new Date()).getTimezoneOffset() * 60 * 1000;    
    var now = (new Date(dgp.time)).getTime() - timezoneOffset
    
    var expiration = new Date(now + expireTime).toISOString().slice(0, -5)
      
    return {
      ref_block_num: head_block_number,
      ref_block_prefix: prefix,
      expiration: expiration,
      operations: [],
      extensions: []
    }
  }
}