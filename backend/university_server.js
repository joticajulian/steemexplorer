const express = require('express')
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

const publicRoot = '/home/julian/pulsar_diploma/pulsar/dist'
const port = process.env.PORT || 3000

/*app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});

app.use(express.static(publicRoot))*/

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
var url = 'mongodb://localhost:27017/univ';

var _mongoClient;
var db;
async function connectDB(url) { 
  if (!_mongoClient){
    _mongoClient = await MongoClient.connect(url);
    db = _mongoClient.db('univ')
  }

  return { 
    db: _mongoClient.db('univ'),
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

async function isRole(id,role) {
  //const { db, client } = await connectDB()
  var o_id = ObjectId(id)
  var user = await db.collection('users').findOne({_id:o_id,role:role})
  if(user) return true
  else return false
}

async function isAdmin(id) {
  return await isRole(id,'admin')
}

async function isStudent(id) {
  return await isRole(id,'student')
}

async function getUser(query) {
  //const { db, client } = await connectDB()
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
      //res.send("Logged in")
      res.send(user) //todo: remove
    })
  })(req, res, next)
})

app.get('/api/logout', function(req, res){
  req.logout();
  console.log("logged out")
  return res.send();
});

const authMiddleware = (req, res, next) => {
  return next() //todo: remove
  if (!req.isAuthenticated()) {
    console.log('401 not authenticated')
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}

const isAdminMiddleware = (req, res, next) => {
  return next(); //todo: remove
  (async () => {
    if( await isAdmin( req.session.passport.user ) )
      next()
    else
      res.status(401).send('You are not an admin')
  })()
}

const isStudentMiddleware = (req, res, next) => {
  (async () => {
    if( await isStudent( req.session.passport.user ) )
      next()
    else
      res.status(401).send('You are not a student')
  })()
}

app.get("/api/user", authMiddleware, (req, res) => {
  (async () => {
    var user = await getUser({_id:ObjectId(req.session.passport.user)})
    console.log([user, req.session])
    res.send({user: user})
  })()
})

app.get("/api/getuser/:user", (req, res) => { //todo: remove
  (async () => {
    var user = await getUser({_id:ObjectId(req.params.user)})
    console.log([user, req.session])
    res.send({user: user})
  })()
})

app.get("/api/students", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  console.log('starting to get students')
  var students = await db.collection('students').find({}).toArray()
  console.log('get students')
  res.send(students)
})

app.post("/api/students", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  var students = await db.collection('students').find(req.body).toArray()
  console.log('get students post')
  res.send(students)
})

app.post("/api/add_user", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  //TODO: input validation
  try{
    var newUser = Utils.validateUser(req.body)
  }catch(err){
    res.status(400).send("Error validating user. "+err.message)
    return
  }
  if( await db.collection('users').findOne(newUser) ){
    res.status(400).send('This user already exists')
    return
  }
  await db.collection('users').insertOne(newUser)
  if(newUser.role === 'student')
    await db.collection('students').insertOne(newUser)
  else if(newUser.role === 'admin')
    await db.collection('admins').insertOne(newUser)
  res.send("User added")
  console.log('User added')
  db.close()
})

app.post("/api/remove_user", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  //TODO: input validation
  if(req.body._id) req.body._id = ObjectId(req.body._id)
  await db.collection('users').remove(req.body)
  await db.collection('students').remove(req.body)
  await db.collection('admins').remove(req.body)
  res.send("User removed")
  console.log("User removed")
})

app.post("/api/update_user", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  //TODO: input validation
  if(req.body.filter._id) req.body.filter._id = ObjectId(req.body.filter._id) 
  await db.collection('users').updateOne(req.body.filter, req.body.update)
  await db.collection('students').updateOne(req.body.filter, req.body.update)
  await db.collection('admins').updateOne(req.body.filter, req.body.update)
  res.send("User updated")
  console.log("User updated")
})

app.get("/api/courses", async (req, res, next) => {
  //const { db, client } = await connectDB()
  var courses = await db.collection('courses').find({}).toArray()
  console.log('get courses')
  res.send(courses)
})

app.post('/api/add_course', authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  try {
    var newcourse = Utils.validateCourse(req.body)
  } catch(err) {
    res.status(400).send('Error validating course. '+err.message)
    return
  }
  if( await db.collection('courses').findOne(newcourse) ){
    res.status(400).send('This course already exists')
    return
  }
  await db.collection('courses').insertOne(newcourse)
  res.send('course added')
  console.log('course added')
})

app.post('/api/remove_course', authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  //TODO: input validation
  await db.collection('courses').remove(req.body)
  res.send('course removed')
  console.log('course removed')
})

app.post("/api/update_course", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //TODO: input validation
  if(req.body.filter._id) req.body.filter._id = ObjectId(req.body.filter._id) 
  await db.collection('courses').updateOne(req.body.filter, req.body.update)
  res.send("course updated")
  console.log("course updated")
})

app.get("/api/badges", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  var badges = await db.collection('badges').find({}).toArray()
  console.log('get badges')
  res.send(courses)
})

app.post('/api/remove_badge', authMiddleware, isAdminMiddleware, async (req, res, next) => {
  await db.collection('badges').remove(req.body)
  res.send('badge removed')
  console.log('badge removed')
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, 
  (username, password, done) => {
    (async () => {
      var user = await getUser({email:username, password:password})
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
    console.log('searching id: '+_id)
    var o_id = new ObjectId(_id)
    var user = await getUser({_id:o_id})
    console.log('deserializeUser: '+JSON.stringify(user));
    done(null, user)
  })()
})


// Blockchain transactions

app.post("/api/create_badges", authMiddleware, isAdminMiddleware, async (req, res, next) => {
  console.log('Creating badge and assertions in a post')
  if(!req.body.course || !req.body.course.name){
    res.status(400).send('No course name defined')
    return
  }
  var course = await db.collection('courses').findOne({name:req.body.course.name})
  if(!course){
    res.status(400).send('Course '+req.body.course.name+' not found')
    return
  }

  var badge = {
    image: course.image,
    id: course._id,
    tags: [],
    related: [],
    name: course.name,
    criteria: {
      narrative: course.description,
      preconditions: course.preconditions,
      id: course._id
    },
    alignment: [],
    issuer: Config.ACCOUNT,
    description: course.description,
    type: 'BadgeClass',
    '@context': 'https://w3id.org/openbadges/v2',
    '@language': 'en'
  }

  var assertions = []
  var assertionsPrivateInfo = []
  req.body.graduates.forEach( (graduate)=>{
    var assertion = {
      issuedOn: graduate.award_time,
      start_date: graduate.start_date,
      award_date: graduate.award_date,
      expiration_date: graduate.expiration_date,
      type: 'Assertion',
      verification: {
        type:'HostedBadge'
      },
      '@context': 'https://w3id.org/openbadges/v2',
      id:'',
      recipient:{
        hashed:false,
        salt:'',
        identity: graduate.key,
        type: 'base58'
      }
    }

    var assertionPrivateInfo = JSON.parse(JSON.stringify(assertion))
    assertionPrivateInfo.recipient.realIdentity = {
      _id: ObjectId(graduate._id),
      name: graduate.name,
      family_name: graduate.family_name
    }

    assertions.push(assertion)
    assertionsPrivateInfo.push(assertionPrivateInfo)
  })

  if(assertions.length > 0) var award_date = assertions[0].award_date.slice(0,-9)
  else var award_date = ''

  var body = 
`${course.description}

## Graduates

`
  assertions.forEach( (a)=>{
    body += a.recipient.identity + '\n'
  })

  var metadata = {
    badge,
    assertions
  }
  var title = course.name + ' ' + award_date
  var author = Config.ACCOUNT
  var permlink = Utils.createPermlink(title)
  var url = '@'+author+'/'+permlink

  var operation = [
    'comment',
    {
      parent_author: '',
      parent_permlink: 'badge',
      author: author,
      permlink: permlink,
      title: title,
      body: body,
      json_metadata: JSON.stringify(metadata)
    }
  ]

  try{
    var postingKey = PrivateKey.fromString(Config.POSTING_KEY)
    var result = await steemClient.broadcast.sendOperations([operation], postingKey)
  }catch(err) {
    res.status(400).send('Error broadcasting operation: '+err.message)
    console.log(err)
    return
  }

  badge.link = { author, permlink, title, url }
  var insertedBadge = await db.collection('badges').insertOne({badge, assertionsPrivateInfo})

  for(var i in assertionsPrivateInfo){
    var a = assertionsPrivateInfo[i]

    var studentBadge = {
      _id: insertedBadge.insertedId,
      issuer: badge.issuer,
      name: badge.name,
      link: badge.link
    }

    var badges = {
      badge: studentBadge,
      assertion: assertions[i]
    }
    console.log(a.recipient.realIdentity._id)
    await db.collection('students').updateOne({_id:a.recipient.realIdentity._id}, {$push:{ badges }})
  }
  res.send(result)
})

app.listen(port, () => {
  console.log("Example app listening on port "+port)
})


/*

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello world!');
}).listen(8084);



*/
