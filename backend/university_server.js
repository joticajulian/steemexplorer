const express = require('express')
const Utils = require('./utils')

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

var client;
var db;
async function connectDB() { 
  if (!client){
    client = await MongoClient.connect(url);
    db = client.db('univ')
  }

  return { 
    db: client.db('univ'),
    client: client
  };
}

connectDB()

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
  var students = await db.collection('users').find({}).toArray()
  console.log('get students')
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
  await db.collection('users').updateOne(req.body.filter, {$set: req.body.update})
  await db.collection('students').updateOne(req.body.filter, {$set: req.body.update})
  await db.collection('admins').updateOne(req.body.filter, {$set: req.body.update})
  res.send("User updated")
  console.log("User updated")
})

app.post('/api/add_subject', authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  try {
    var newSubject = Utils.validateSubject(req.body)
  } catch(err) {
    res.status(400).send('Error validating subject. '+err.message)
    return
  }
  if( await db.collection('subjects').findOne(newSubject) ){
    res.status(400).send('This subject already exists')
    return
  }
  await db.collection('subjects').insertOne(newSubject)
  res.send('Subject added')
  console.log('Subject added')
})

app.post('/api/remove_subject', authMiddleware, isAdminMiddleware, async (req, res, next) => {
  //const { db, client } = await connectDB()
  //TODO: input validation
  await db.collection('subjects').remove(req.body)
  res.send('Subject removed')
  console.log('Subject removed')
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
