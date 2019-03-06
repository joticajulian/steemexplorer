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

const environment = process.env.NODE_ENV || 'development';
const finalConfig = config[environment];

const SBD = "EUR";
const STEEM = "EFTG";
const SP = "SP";
const VESTS = "VESTS";

const HARDFORK = 19

const STEEM_ADDRESS_PREFIX = "EUR";
const STEEM_100_PERCENT = 10000;
const STEEM_VOTE_REGENERATION_SECONDS = 5 * 24 * 60 * 60;
const STEEM_INFLATION_RATE_START_PERCENT = 978;
const STEEM_INFLATION_NARROWING_PERIOD = 250000;
const STEEM_INFLATION_RATE_STOP_PERCENT = 95;
const STEEM_BLOCKS_PER_YEAR = (365 * 24 * 60 * 60) / 3;
const STEEM_BLOCKS_PER_DAY = (24 * 60 * 60) / 3;
const STEEM_SBD_START_PERCENT = 900;
const STEEM_SBD_STOP_PERCENT = 1000;

const MAP = {
  TOP_WITNESSES: 30,
  INI_POS : [50.5, 15], //latitude, longitude
  INI_ZOOM : 4 ,
}

const APP_VERSION = "pulsar/0.0.2";

export default {

  RPC_NODE: finalConfig.RPC_NODE,
  IMAGE_HOSTER: finalConfig.IMAGE_HOSTER,
  ELASTIC: finalConfig.ELASTIC,
  CDN: finalConfig.CDN,
  
  SBD: SBD,
  STEEM: STEEM,
  SP: SP,
  VESTS: VESTS,
  HARDFORK: HARDFORK,
  
  EFTG_HARDFORK_0_1: finalConfig.EFTG_HARDFORK_0_1,

  STEEM_ADDRESS_PREFIX: STEEM_ADDRESS_PREFIX,
  STEEM_100_PERCENT: STEEM_100_PERCENT,
  STEEM_VOTE_REGENERATION_SECONDS: STEEM_VOTE_REGENERATION_SECONDS,
  STEEM_INFLATION_RATE_START_PERCENT: STEEM_INFLATION_RATE_START_PERCENT,
  STEEM_INFLATION_NARROWING_PERIOD: STEEM_INFLATION_NARROWING_PERIOD,
  STEEM_INFLATION_RATE_STOP_PERCENT: STEEM_INFLATION_RATE_STOP_PERCENT,
  STEEM_BLOCKS_PER_YEAR: STEEM_BLOCKS_PER_YEAR,
  STEEM_BLOCKS_PER_DAY: STEEM_BLOCKS_PER_DAY,
  STEEM_SBD_START_PERCENT: STEEM_SBD_START_PERCENT,
  STEEM_SBD_STOP_PERCENT: STEEM_SBD_STOP_PERCENT,

  MAP:MAP,

  APP_VERSION: APP_VERSION,
};
