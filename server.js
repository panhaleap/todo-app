let express = require('express')
let mongodb = require('mongodb')

//npm install sanitize-html
//Use this for security, use for prevent user from input untrust content. 
//Example: content which harm our web site, like emmbed JavaScript
let sanitizeHTML = require('sanitize-html')

let app = express()
let db

//This useful, when we hosting app to heroku, and heroku use some other port for our app.
let port = process.env.PORT

if (port == null || port == "") {
  port = 3000
}

//Enable accessing to folder public
app.use(express.static('public'))

let connectionString = 'mongodb+srv://UserTodoApp:UisKD6f9wk34JXHX@cluster0-loifk.mongodb.net/TodoApp?retryWrites=true&w=majority'
//client param contains info about mongoDb environment we that
//just connected to

mongodb.connect(connectionString, {useNewUrlParser: true}, function(err, client){
    //mean, util db connnection work first, and next our app is good to go.
    db = client.db()
    app.listen(port)
})

app.use(express.json())
//to enable access to res body of object which send from client
app.use(express.urlencoded({extended: false}))

function passwordProtected(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"')
  //next(), meant if function done, then go on to the next argument or next function. 
  //Example, function(req, res) in app.get('/', passwordProtected, function(req, res){...
  //next()

  //this will show in console with base64 format
  console.log(req.headers.authorization)
  //Mean, if user type in the correct username and password
  if (req.headers.authorization == "Basic bGVhcm46bm9kZUpT") {
    next()
  } else {
    res.status(401).send("Authentication required")
  }

}

//this tell the express to use passwordProtected function for all route
//it's going to add function passwordProtected as the first function for all rounte, instead of writing Example: app.get('/', passwordProtected, function(req, res){...
app.use(passwordProtected)

//Meaning, if we recieve the get request
//in order to use app.get we have to write require express 
//app.get('/', passwordProtected, function(req, res){...
app.get('/', function(req, res){
    db.collection('items').find().toArray(function(err, items) {
       //console.log(">>>>>>>>>>>>>>>>>>>>>> "+JSON.stringify(items))
       res.send(`
     <!DOCTYPE html>
     <html>
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Simple To-Do App</title>
       <link rel="shortcut icon" href="https://buddlakeah.com/wp-content/uploads/2018/09/cat.png" />
       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
     </head>
     <body>
       <div class="container">
         <h1 class="display-4 text-center py-1">To-Do App</h1>
         
         <div class="jumbotron p-3 shadow-sm">
           <form id="create-form" action="/create-item" method="POST">
             <div class="d-flex align-items-center">
               <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
               <button class="btn btn-primary">Add New Item</button>
             </div>
           </form>
         </div>
         
         <ul id="item-list" class="list-group pb-5">
         </ul>
       </div>
     
     <script>
           //stringify converts java script data into string of text
           let items = ${JSON.stringify(items)}
     </script>  
     <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
     <script src="/browser.js">
           
     </script>  
     </body>
     </html>
     `)
    })
    
})

//req and res are the param that passing by express framework
app.post('/create-item', function(req, res){

  //allowedTags: [], we put empty array cause we don't want to allow user input html tags
  // allowedAttributes: {}, empty object casue we don't want to allow any attribute user input
  //So now, whatever user input will be store in safeText and it's going to be plan cleanup text
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})  
  // db.collection('items').insertOne( {text: req.body.text}, function(err, info){
    db.collection('items').insertOne( {text: safeText}, function(err, info){
        //res.redirect('/')

        //res.json() is the new item we just created
        res.json(info.ops[0])
    })
})

app.post('/update-item', function(req, res){
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})    
  //since mongoDb works with id in a special way, so we can't input normal string id. 
  //So we have to create new instance for id 
  // db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)}, {$set: {text: req.body.text}}, function(){
    db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)}, {$set: {text: safeText}}, function(){
    res.send("Success")
  })
})

app.post('/delete-item', function(req, res) {
  db.collection('items').deleteOne({_id: new mongodb.ObjectID(req.body.id)}, function(){
    res.send("Success")
  })
})

