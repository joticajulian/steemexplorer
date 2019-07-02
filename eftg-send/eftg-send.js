const dsteem = require('eftg-dsteem')
const crypto = require('crypto')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const config = require('./config.js')
const validate = require('./validate.js')

const timeout = ms => new Promise(res => setTimeout(res, ms))

/**
 * Creates a hash of a file, sign it using the private key, 
 * and uploads the file with the signature to the Hoster
 */
async function uploadFile (filename, username, privKey) {
  const filedata = fs.readFileSync(filename)

  const imageHash = crypto.createHash('sha256')
    .update('ImageSigningChallenge')
    .update(filedata)
    .digest()
  const signature = privKey.sign(imageHash).toString()
  const urlWithSignature = `${ config.IMAGE_HOSTER }/${ username }/${ signature }`
    
  // Upload file
  let form = new FormData()
  form.append('file', fs.createReadStream(filename))
    
  var response = await axios({
       method: 'post',
       url: urlWithSignature,
       data: form,
       headers: form.getHeaders()
     })
           
  return response.data.url
}


/**
 * Generate a post using the format for OAM publications 
 */
function generatePost (username, data, dic) {
  // Definition of the link to the post
  var permlink = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^0-9a-z-]/gi, "")
  // optional: add random string to permlink
  permlink = Math.random().toString(36).substring(7) + '-' + permlink
  
  var body = '[[pdf link]](' + data.url + ')'
  
  validate.validateIssuerName      (data.issuer_name)
  validate.validateHomeMemberState (data.home_member_state, dic.hms)
  validate.validateIdentifierType  (data.identifier_type  , dic.identifier)
  validate.validateIdentifierValue (data.identifier_value , data.identifier_type, dic.identifier, dic.hms)
  validate.validateSubclass        (data.subclass         , dic.subclass)
  validate.validateDisclosureDate  (data.disclosure_date  , data.submission_date, data.financial_year)
  validate.validateSubmissionDate  (data.submission_date  , data.disclosure_date)
  validate.validateStorageDate     (data.storage_date)
  validate.validateDocumentLanguage(data.document_language, dic.lang)
  validate.validateTitle           (data.title)
  validate.validateFinancialYear   (data.financial_year   , data.disclosure_date)
  validate.validateTypeSubmission  (data.type_submission)

  var subclassTag = getSubclassTag(data.subclass, dic.subclass)
  var identifier_id = getIdentifierId(data.identifier_type, dic.identifier)

  var json_metadata = {
    issuer_name:       data.issuer_name,
    home_member_state: data.home_member_state,
    identifier_id:     identifier_id,
    identifier_value:  data.identifier_value,
    subclass:          data.subclass,
    disclosure_date:   data.disclosure_date,
    submission_date:   data.submission_date,
    document_language: data.document_language,
    comment:           data.title,
    financial_year:    data.financial_year,
    type_submission:   data.type_submission,
    tags:              [ subclassTag,
                         data.issuer_name,
                         data.home_member_state,
                         data.identifier_value
                       ],
    storage_date:      data.storage_date,
    permlink:          permlink,
    app:               config.APP_VERSION,
  }

  return {
    author: username,
    body: body,
    json_metadata: JSON.stringify(json_metadata),
    parent_author: '',
    parent_permlink: 'oam',
    permlink: permlink,
    title: data.title
  }
}

function getSubclassTag(id, dic) {
  var subclass
  for(var i in dic){
    subclass = dic[i].subclass.find( (subc)=>{return subc.id == id})
    if(subclass) break
  }
  return subclass.tag 
}

function getIdentifierId(type, dic) {
  identifier = dic.find( (ide)=>{return ide.type === type} )
  return identifier.id
}

/**
 * Defines a new transaction without operations
 */
async function newTransaction() {
  var client = new dsteem.Client(config.RPC_NODE)
      
  const dgp = await client.database.getDynamicGlobalProperties()
      
  var head_block_number = dgp.head_block_number
  var head_block_id = dgp.head_block_id
  var prefix = Buffer.from(head_block_id, 'hex').readUInt32LE(4)
         
  var expireTime = 3590 * 1000
  var expiration = new Date(Date.now() + expireTime).toISOString().slice(0, -5)
      
  return {
    ref_block_num: head_block_number,
    ref_block_prefix: prefix,
    expiration: expiration,
    operations: [],
    extensions: []
  }
}

async function loadDictionary() {
  var dictionary = {}
  var hms        = await axios.get(config.IMAGE_HOSTER + '/home_member_states.json')
  var identifier = await axios.get(config.IMAGE_HOSTER + '/identifier.json')
  var subclass   = await axios.get(config.IMAGE_HOSTER + '/class_subclass_tree.json')
  var lang       = await axios.get(config.IMAGE_HOSTER + '/lang.json')
  var server     = await axios.get(config.IMAGE_HOSTER + '/server_config.json')

  dictionary.hms        = hms.data.slice()
  dictionary.identifier = identifier.data.slice()
  dictionary.subclass   = subclass.data.slice()
  dictionary.lang       = lang.data
  dictionary.server     = server.data

  return dictionary
}

async function publishBulk(data, username, privKey){
  console.log('-- Publish Bulk --')
  let opts = {}
  if(process.env.CHAIN_ID) opts.chainId = process.env.CHAIN_ID
  var client = new dsteem.Client(config.RPC_NODE, opts)
  
  var dictionary = await loadDictionary()

  const storage_date = new Date().toISOString().slice(0, -5)
  
  for(var i in data){    
    try{
      // Load and sign file
      data[i].url = await uploadFile(data[i].filename, username, privKey)
      data[i].storage_date = storage_date
      
      // Create the post
      var post = generatePost(username,data[i],dictionary)
      
      var responsePost = await client.broadcast.comment(post, privKey)
      
      console.log(`New document published!! [${parseInt(i)+1}/${data.length}]`)
      console.log(`permlink: @${config.username}/${post.permlink}`)
      await timeout(3000)
    }catch(error){
      console.log(`Error with entry number ${parseInt(i)+1}. Details:`)
      console.log(JSON.stringify(data[i]))
      console.log(error)
    }
  }
}

async function publishOneTrx(data, username, privKey){
  console.log('-- Publish One Trx --')
  let opts = {}
  if(process.env.CHAIN_ID) opts.chainId = process.env.CHAIN_ID
  var client = new dsteem.Client(config.RPC_NODE, opts)

  var dictionary = await loadDictionary()

  const storage_date = new Date().toISOString().slice(0, -5)
  
  var operations = []
  
  for(var i in data){    
    try{
      // Load and sign file
      data[i].url = await uploadFile(data[i].filename, username, privKey)
      data[i].storage_date = storage_date
      
      // Create the post
      var post = generatePost(username,data[i],dictionary)
      
      operations.push(['comment',post])      
      
    }catch(error){
      console.log(`Error with entry number ${parseInt(i)+1}. Details:`)
      console.log(JSON.stringify(data[i]))
      if(error.response) {
        // error from axios
        console.log(error.response.statusText)
        console.log(error.response.data)
      }else{
        console.log(error)
      }      
    }
  }  
  
  try{
    var trx = await newTransaction()
    trx.operations = operations
    var sgnTrx = client.broadcast.sign(trx , privKey)
    response = await client.broadcast.send(sgnTrx)
    
    console.log(`${parseInt(operations.length)} documents published!!\nPermlinks:`)
    for(var i in operations){
      console.log(`@${operations[i][1].author}/@${operations[i][1].permlink}`)
    }    
  }catch(error){
    console.log(`Error broadcasting documents to the blockchain. Details:`)
    console.log(error)
  }
}

module.exports = {
  publishBulk,
  publishOneTrx
}