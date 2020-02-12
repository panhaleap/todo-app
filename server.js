let express = require('express')
let mongodb = require('mongodb')

let app = express()
let db 

//Enable accessing to folder public
app.use(express.static('public'))

let connectionString = 'mongodb+srv://UserTodoApp:xBHBrUCaGcZeCIL2@cluster0-loifk.mongodb.net/TodoApp?retryWrites=true&w=majority'
//client param contains info about mongoDb environment we that
//just connected to

mongodb.connect(connectionString, {useNewUrlParser: true}, function(err, client){
    //mean, util db connnection work first, and next our app is good to go.
    db = client.db()
    app.listen(3000)
})

app.use(express.json())
//to enable access to res body of object which send from client
app.use(express.urlencoded({extended: false}))

//Meaning, if we recieve the get request
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
    db.collection('items').insertOne( {text: req.body.text}, function(err, info){
        //res.redirect('/')

        //res.json() is the new item we just created
        res.json(info.ops[0])
    })
})

app.post('/update-item', function(req, res){
  //since mongoDb works with id in a special way, so we can't input normal string id. 
  //So we have to create new instance for id 
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.id)}, {$set: {text: req.body.text}}, function(){
    res.send("Success")
  })
})

app.post('/delete-item', function(req, res) {
  db.collection('items').deleteOne({_id: new mongodb.ObjectID(req.body.id)}, function(){
    res.send("Success")
  })
})

