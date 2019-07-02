// Authentication
const username = 'your username'
const password = 'your posting key' // Posting key

const APP_VERSION = 'sendjs/1.0.0'

const config = {
  'production': {
    RPC_NODE : { url: "https://api.eftg.eu" },
    IMAGE_HOSTER : { url: "https://cdn.blkcc.xyz" },
    ELASTIC : { url: "https://api.eftg.eu/pulsar/" },
    CDN : { url: "https://cdn.blkcc.xyz/" },
    EFTG_HARDFORK_0_1 : false
  },
  'acceptance': {
    RPC_NODE : { url: "https://api.blkcc.xyz" },
    IMAGE_HOSTER : { url: "https://cdn.acc.blkcc.xyz" },
    ELASTIC : { url: "https://api.blkcc.xyz/pulsar/" },
    CDN : { url: "https://cdn.acc.blkcc.xyz/" },
    EFTG_HARDFORK_0_1 : false
  },
  'development': {
    RPC_NODE : { url: "https://apidev.blkcc.xyz" },
    IMAGE_HOSTER : { url: "https://cdn.dev.blkcc.xyz" },
    ELASTIC : { url: "https://apidev.blkcc.xyz/pulsar/" },
    CDN : { url: "https://cdn.dev.blkcc.xyz/" },
    EFTG_HARDFORK_0_1 : true
  }
}

const environment = process.env.NODE_ENV || 'production'
const finalConfig = config[environment]
const finalUsername = process.env.USERNAME || username
const finalPassword = process.env.PASSWORD || password

module.exports = {
  username: finalUsername,
  password: finalPassword,
  IMAGE_HOSTER : finalConfig.IMAGE_HOSTER.url,
  RPC_NODE : finalConfig.RPC_NODE.url,
  EFTG_HARDFORK_0_1 : finalConfig.EFTG_HARDFORK_0_1,
  APP_VERSION
}
