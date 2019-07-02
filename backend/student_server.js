const express = require('express')
const axios = require('axios')
const Utils = require('./utils')
const Config = require('./config')
const { Client, PrivateKey } = require('eftg-dsteem')

// creating an express instance
const app = express()

const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const passport = require('passport')

// getting the local authentication type
const LocalStrategy = require('passport-local').Strategy

const publicRoot = '/home/julian/pulsar_diploma/wallet/dist'
const port = process.env.PORT || 3000

/*app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});

app.use(express.static(publicRoot))*/

/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});*/
app.use(express.static(publicRoot))

app.use(bodyParser.json())
app.use(cookieSession({
    name: 'mysession',
    keys: ['vueauthrandomkey'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours 
  }))

app.use(passport.initialize());
app.use(passport.session());

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://localhost:27017/wallet';

var _mongoClient;
var db;
async function connectDB(url) { 
  if (!_mongoClient){
    _mongoClient = await MongoClient.connect(url);
    db = _mongoClient.db('wallet')
  }

  return { 
    db: _mongoClient.db('wallet'),
    client: _mongoClient
  };
}

function RPCnode_initClient(address = Config.RPC_NODES[0]) {
  let opts = {}
  opts.addressPrefix = Config.STEEM_ADDRESS_PREFIX
  opts.timeout = Config.DSTEEM_TIMEOUT
  if(process.env.VUE_APP_CHAIN_ID) opts.chainId = process.env.VUE_APP_CHAIN_ID
  opts.chainId = 'a118feb47e63e942c55e4bc991e74f9e2e2d4d099e32f2ae7d55a66f6b415f14'
  return new Client(address, opts)
}

connectDB(url)
var steemClient = RPCnode_initClient()

async function getUser(query) {
  var user = await db.collection('users').findOne(query)
  return user
}

app.get("/", (req, res, next) => {
  res.sendFile("index.html", { root: publicRoot })
})

app.post("/api/login", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(400).send([user, "Cannot log in", info])
    }

    req.login(user, (err) => {
      res.send(user)
    })
  })(req, res, next)
})

app.get('/api/logout', function(req, res){
  req.logout();
  console.log("logged out")
  return res.send();
});

const authMiddleware = (req, res, next) => {
  //return next() //todo: remove
  if (!req.isAuthenticated()) {
    console.log('401 not authenticated')
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}

app.get("/api/login", authMiddleware, async (req, res) => {
  console.log('GET /api/login')
  var user = await getUser({_id:ObjectId(req.session.passport.user)})
  res.send(user)
})

app.post("/api/create_keys", authMiddleware, async (req, res, next) => {
  var university = req.body.university
  var course = req.body.course
  var filter = {_id:ObjectId(req.session.passport.user)}
  var user = await getUser(filter)

  var privKey = PrivateKey.fromSeed(user.username + user.password + university + course)
  var pubKey = privKey.createPublic(Config.STEEM_ADDRESS_PREFIX)
  var key = {
    university,
    course,
    pending: true,
    badge: {},
    public_key: pubKey.toString(),
    private_key: privKey.toString()
  }  

  await db.collection('users').updateOne(filter,{ $push: { keys: key } })
  res.send({ok:true})
})

app.post("/api/update_key", authMiddleware, async (req, res, next) => {
  var filter = {_id:ObjectId(req.session.passport.user)}
  var user = await getUser(filter)

  var issuer = ''
  var permlink = ''
  
  var url = req.body.badge_url.trim()
  var permlink = url.substr(url.lastIndexOf('/') + 1);
  var issuer = url.substring(url.lastIndexOf('@') + 1, url.lastIndexOf('/'));

  var badge = {
    issuer,
    permlink
  }

  var content = await steemClient.database.call( 'get_content', [issuer, permlink] )
  if(!content){
    res.status(404).send('There is no content on @'+issuer+'/'+permlink)
    return
  }

  var key_found = false
  var metadata = JSON.parse(content.json_metadata)
  if(metadata && metadata.assertions){
    user.keys.forEach( (key) => {
      var assertion = metadata.assertions.find( (a)=>{ return a.recipient.identity === key.public_key })
      if(assertion){
        key_found = true
        var filter = {
          _id:ObjectId(req.session.passport.user),
          'keys.public_key': key.public_key
        }
        db.collection('users').updateOne( filter, { $set: { 'keys.$.badge': badge, 'keys.$.pending': false } })
        console.log('badge added')
      }
    })
  }
  if(key_found){
    res.send('Badge added')
    console.log('Badge added')
    return
  }

  res.status(404).send('Nothing to update')
})

app.post("/api/get_key", authMiddleware, async (req, res, next) => {
  var university = req.body.university
  var course = req.body.course
  var filter = {_id:ObjectId(req.session.passport.user)}
  var user = await getUser(filter)
  for(var i in user.keys){
    if(user.keys[i].university === university && user.keys[i].course === course){
      res.send(user.keys[i].public_key)
      return
    }
  }
  res.status(404).send('Public key not found')
  return
})

app.get("/api/get_keys", authMiddleware, async (req, res, next) => {
  var filter = {_id:ObjectId(req.session.passport.user)}
  var user = await getUser(filter)
  res.send(user.keys)
  return
})

app.post('/api/update_issuer', authMiddleware, async (req, res, next) => {
  var filter = {
    _id:ObjectId(req.session.passport.user),
    'issuers.name': req.body.issuer.name
  }
  var issuer = await db.collection('users').findOne(filter)
  if(issuer){
    db.collection('users').updateOne( filter, { $set: { 'issuers.$': req.body.issuer } })
    console.log('issuer updated')
  }else{
    db.collection('users').updateOne( filter, { $push: { issuers: req.body.issuer } })
    console.log('issuer added')
  }
  res.send('issuer updated')
})

app.post('/api/login_issuer/:issuer', authMiddleware, async (req, res, next) => {
  var filter = {
    _id:ObjectId(req.session.passport.user),
    'issuers.name': req.params.issuer
  }
  var issuer = await db.collection('users').findOne(filter)
  if(issuer && issuer.data && issuer.data.api && issuer.data.username && issuer.data.password) {
    try{
      var login = {
        username: issuer.data.username,
        password: issuer.data.password
      }
      var response = await axios.post(issuer.data.api + 'login', login)
      res.send('login')
      return
    }catch(error){
      console.log('login error')
      console.log(error)
      res.status(404).send(error.message)
      return
    }
  }
  res.status(401).send('No issuer data')
  return
})

app.get('/api/issuers', authMiddleware, async (req, res, next) => {
  var filter = {_id:ObjectId(req.session.passport.user)}
  var user = await getUser(filter)
  if(user.issuers) res.send(user.issuers)
  else res.send([])
  return
})

app.post("/api/create_proof", authMiddleware, async (req, res, next) => {

  var filter = {_id:ObjectId(req.session.passport.user)}
  var user = await getUser(filter)

  var issuer = ''
  var permlink = ''
  
  var url = req.body.badge_url.trim()
  var permlink = url.substr(url.lastIndexOf('/') + 1);
  var issuer = url.substring(url.lastIndexOf('@') + 1, url.lastIndexOf('/'));
  var content = await steemClient.database.call( 'get_content', [issuer, permlink] )
  if(!content || !content.json_metadata){
    res.status(404).send('There is no content on @'+issuer+'/'+permlink)
    return
  }
  var metadata = JSON.parse(content.json_metadata)
  if(!metadata || !metadata.assertions){
    res.status(404).send('@'+issuer+'/'+permlink+' does not corresponds with a badge with assertions')
    return
  }
  var assertion = metadata.assertions.find( 
    (a)=>{
      for(var i in user.keys) if(user.keys[i].public_key === a.recipient.identity) return true 
      return false
    }
  )
  if(!assertion){
    res.status(404).send('There are not assertions in the badge that match with this private key')
    return
  }
  var privKey = null
  for(var i in user.keys)
    if(user.keys[i].public_key === assertion.recipient.identity)
      privKey = PrivateKey.fromString(user.keys[i].private_key)

  var trx = {
    ref_block_num: 0,
    ref_block_prefix: 0,
    expiration: req.body.expiration_date,
    operations: [
      ['transfer',
        {
          from: '',
          to: '',
          amount: '0.001 ' + Config.STEEM_ADDRESS_PREFIX,
          memo: req.body.message
        }
      ]
    ],
    extensions: []
  }
  var sgnTrx = steemClient.broadcast.sign(trx, privKey)
  var presentation = {
    badge: { issuer, permlink },
    proof: sgnTrx
  }
  res.send(presentation)
})

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, 
  (username, password, done) => {
    (async () => {
      var user = await getUser({username:username, password:password})
      if(user)
        done(null, user)
      else
        done(null, false, {message: 'Incorrect username or password'})
    })()
  }
))

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((_id, done) => {
  (async () => {
    var o_id = new ObjectId(_id)
    var user = await getUser({_id:o_id})
    done(null, user)
  })()
})

app.get("*", (req, res, next) => {
  res.sendFile("index.html", { root: publicRoot })
})

app.listen(port, () => {
  console.log("Student app listening on port "+port)
})
