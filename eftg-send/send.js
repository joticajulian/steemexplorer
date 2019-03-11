const dsteem = require('eftg-dsteem')
const eftgSend = require('./eftg-send.js')
const config = require('./config.js')
const data = require('./data.json') 

const username = config.username
const privKey = dsteem.PrivateKey.fromString(config.password)

eftgSend.publishBulk(data, username, privKey)
