const dsteem = require('eftg-dsteem')
const crypto = require('crypto')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const config = require('./config.js')

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
           
  return response.data.url;
}

/**
 * Generate a post using the format for OAM publications 
 */
function generatePost (username, data) {
  // Definition of the link to the post
  var permlink = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^0-9a-z-]/gi, "")
  // optional: add random string to permlink
  permlink = Math.random().toString(36).substring(7) + '-' + permlink
  
  var body = '[[pdf link]](' + data.url + ')'

  var json_metadata = {
    issuer_name:       data.issuer_name,
    home_member_state: data.home_member_state,
    identifier_id:     data.identifier_id,
    identifier_value:  data.identifier_value,
    subclass:          data.subclass,
    disclosure_date:   data.disclosure_date,
    submission_date:   data.submission_date,
    type_submission:   data.type_submission,
    document_language: data.document_language,
    comment:           data.title,
    financial_year:    data.financial_year,
    tags:              [ data.subclassTag,
                         data.issuer_name,
                         data.home_member_state,
                         data.identifier_value
                       ],
    storage_date:      data.storage_date,
    permlink:          data.permlink,
    app:               'sendjs/0.0.1'
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

/**
 * Defines a new transaction without operations
 */
async function newTransaction() {
  var client = new dsteem.Client(config.RPC_NODE)
      
  const dgp = await client.database.getDynamicGlobalProperties()
      
  var head_block_number = dgp.head_block_number;
  var head_block_id = dgp.head_block_id;
  var prefix = Buffer.from(head_block_id, 'hex').readUInt32LE(4);
         
  var expireTime = 3590 * 1000;
  var expiration = new Date(Date.now() + expireTime).toISOString().slice(0, -5)
      
  return {
    ref_block_num: head_block_number,
    ref_block_prefix: prefix,
    expiration: expiration,
    operations: [],
    extensions: []
  }
}

async function publishBulk(data, username, privKey){
  const client = new dsteem.Client(config.RPC_NODE)

  const storage_date = new Date().toISOString().slice(0, -5)
  
  for(var i in data){    
    try{
      // Load and sign file
      data[i].url = await uploadFile(data[i].filename, username, privKey)
      data[i].storage_date = storage_date
      
      // Create the post
      var post = generatePost(username,data[i])
      
      var responsePost = await client.broadcast.comment(post, privKey);
      console.log(`New document published!! [${parseInt(i)+1}/${data.length}]`)
      console.log(`permlink: @${config.username}/${post.permlink}`)      
    }catch(error){
      console.log(`Error with entry number ${parseInt(i)+1}. Details:`)
      console.log(error)
    }
  }
}

async function publishOneTrx(data, username, privKey){
  const client = new dsteem.Client(config.RPC_NODE)

  const storage_date = new Date().toISOString().slice(0, -5)
  
  var operations = []
  
  for(var i in data){    
    try{
      // Load and sign file
      data[i].url = await uploadFile(data[i].filename, username, privKey)
      data[i].storage_date = storage_date
      
      // Create the post
      var post = generatePost(username,data[i])
      
      operations.push(['comment',post])      
      
    }catch(error){
      console.log(`Error uploading file number ${parseInt(i)+1}. Details:`)
      console.log(error.response.statusText)
      console.log(error.response.data)      
    }
  }  
  
  try{
    var trx = await newTransaction()
    trx.operations = operations
    var sgnTrx = client.broadcast.sign(trx , privKey);
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


async function publish(data, username, privKey){

  const client = new dsteem.Client(config.RPC_NODE)

  const submission_date = new Date().toISOString().slice(0, -5)
  
  for(i in data){
  
    
    
  try{
    // Load and sign file
    const pdfUrl = await uploadFile(data[i].filename, username, privKey)
    
    // Definition of content
    const body = '[[pdf link]](' + pdfUrl + ')'

    const json_metadata = {
      issuer_name:       data[i].issue_name,
      home_member_state: data[i].home_member_state,
      identifier_id:     data[i].identifier_id,
      identifier_value:  data[i].identifier_value,
      subclass:          data[i].subclass,
      disclosure_date:   data[i].disclosure_date,
      document_language: data[i].document_language,
      comment:           data[i].title,
      financial_year:    data[i].financial_year,
      tags:              [ data[i].subclassTag,
                           data[i].issue_name,
                           data[i].home_member_state,
                           data[i].identifier_value
                         ],
      submission_date:   submission_date,
      app:               'sendjs/0.0.1'
    }

    // Definition of the link to the post
    let permlink = data[i].title.toLowerCase().replace(/\s+/g, "-").replace(/[^0-9a-z-]/gi, "")
    // optional: add random string to permlink
    permlink = Math.random().toString(36).substring(7) + '-' + permlink

    const post = {
      author: username,
      body: body,
      json_metadata: JSON.stringify(json_metadata),
      parent_author: '',
      parent_permlink: 'oam',
      permlink: permlink,
      title: data[i].title
    }

    // Broadcast to the blockchain
    const responsePost = await client.broadcast.comment(post, privKey);
    console.log(`New report published!! [${parseInt(i)+1}/${data.length}]`)
    console.log(`permlink: @${config.username}/${permlink}`)
    console.log(`link pdf: ${pdfUrl}`)
  }catch(error){
    console.log(`Error with entry number ${parseInt(i)+1}. Details:`)
    console.log(error)
  }
  
  }
}



async function publish2(data, username, privKey){
  const client = new dsteem.Client(config.RPC_NODE)

  const submission_date = new Date().toISOString().slice(0, -5)
  
  var operations = []
  
  for(var i in data){    
    try{
      // Load and sign file
      data[i].url = await uploadFile(data[i].filename, username, privKey)
      data[i].error = false
      
      var body = '[[pdf link]](' + data[i].url + ')'

      var json_metadata = {
        issuer_name:       data[i].issue_name,
        home_member_state: data[i].home_member_state,
        identifier_id:     data[i].identifier_id,
        identifier_value:  data[i].identifier_value,
        subclass:          data[i].subclass,
        disclosure_date:   data[i].disclosure_date,
        document_language: data[i].document_language,
        comment:           data[i].title,
        financial_year:    data[i].financial_year,
        tags:              [ data[i].subclassTag,
                             data[i].issue_name,
                             data[i].home_member_state,
                             data[i].identifier_value
                           ],
        submission_date:   submission_date,
        app:               'sendjs/0.0.1'
      }

      // Definition of the link to the post
      var permlink = data[i].title.toLowerCase().replace(/\s+/g, "-").replace(/[^0-9a-z-]/gi, "")
      // optional: add random string to permlink
      permlink = Math.random().toString(36).substring(7) + '-' + permlink

      var post = {
        author: username,
        body: body,
        json_metadata: JSON.stringify(json_metadata),
        parent_author: '',
        parent_permlink: 'oam',
        permlink: permlink,
        title: data[i].title
      }
      
      operations.push(['comment',post])      
      
    }catch(error){
      console.log(`Error uploading file number ${parseInt(i)+1}. Details:`)
      console.log(error)
      data[i].error = true
    }
  }  
  
  try{
    //const responsePost = await client.broadcast.comment(post, privKey);
    var trx = await newTransaction()
    trx.operations = operations
    var sgnTrx = client.broadcast.sign(trx , privKey);
    console.log('Signed Transaction')
    console.log(sgnTrx)
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
  publish,
  publish2,
  publishBulk,
  publishOneTrx
}