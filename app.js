var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer')

app.use(function(req, res, next) {
if (!req.user) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
}
next();
});

// admin username and password
const email = process.env.EMAIL;
const pass = process.env.PASSWORD;

const port = 3001 || process.env.PORT;

//mlab
let dbUrl = process.env.DB_URL;

// mongoose.connect("mongodb://127.0.0.1:27017/test", {useNewUrlParser: true});
mongoose.connect(dbUrl, {useNewUrlParser: true});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

var linkSchema = new mongoose.Schema({
  url_text: String,
  category: String,
  url: String,
  desc: String,
});
let Linky = mongoose.model('Linky', linkSchema);

//bool to check if someone is logged in
global.isSignedIn = false;

// RESTful Routes
app.get('/', function(req, res){
  if (isSignedIn) {
    res.redirect('/links');
  } else {
    res.redirect('/admin');
  }
});

// Index Route
app.get('/links', function(req, res){
  Linky.find({}, function(err, blogs){
    if(err){
      console.log(err);
      res.send('opps error')
    } else {
      res.render('index', {blogs: blogs});
    }
  });
});

// New Route
app.get('/links/new', function(req, res){
  if (isSignedIn) {
    res.render('new');
  } else {
    res.render('notlogged');
  }
});

//login route
app.get('/admin', (req, res) => {
	res.render('login')
});

//logout route
app.get('/logout', (req, res) => {
  global.isSignedIn = false;
  res.redirect('/links');
})

//verification
app.post('/signin', (req, res, next) => {

  if (req.body.email === email && req.body.password === pass) {
    global.isSignedIn = true
    res.redirect('/links');
  } else {
    global.isSignedIn = false
    res.redirect('/links');
  }
  
});

// Create Route
app.post('/links', function(req, res){
  if (isSignedIn) {
    req.body.blog.desc = req.sanitize(req.body.blog.desc);
    Linky.create(req.body.blog, function(err, newBlog){
    if(err){
      console.log(err);
      res.render('new');
    } else {
      res.redirect('/links');
    }
  });
  } else {
    res.render('notlogged');
  }
  
});

// Edit Route
app.get('/links/:id/edit', function(req, res){
  Linky.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect('/links');
    } else {
      if (isSignedIn) {
        res.render('edit', {blog: foundBlog});
      } else {
        res.render('notlogged');
      }
    }
  });
});

// Update Route
app.put('/links/:id', function(req, res){
  req.body.blog.desc = req.sanitize(req.body.blog.desc);
  console.log(req.body.blog)
  console.log(req.params.id)
  Linky.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err){
      res.redirect('/links');
      console.log(err)
    } else {
      res.redirect('/links');
    }
  });
});

// Delete Route
app.delete('/links/:id', function(req, res){
  Linky.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('/links');
    } else {
      res.redirect('/links');
    }
  });
});

app.listen(port, function(){
  console.log('restful-blog-app server has started! on port 3001');
});