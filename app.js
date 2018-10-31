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

//bool to check if someone is logged in
let isSignedIn = false;
//check if credentials are wrong
let isWrong = false;

// admin username and password
const email = process.env.EMAIL;
const pass = process.env.PASSWORD;


const port = process.env.PORT || 3001;

//mlab
let dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {useNewUrlParser: true});

// mongoose.connect("mongodb://127.0.0.1:27017/test", {useNewUrlParser: true});

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

app.listen(port, (req, res) => {
  console.log('restful-blog-app server has started! on port 3001');
});

// RESTful Routes
app.get('/', (req, res) => {
  isSignedIn = false;
  if (isSignedIn) {
    res.redirect('/links');
  } else {
    res.redirect('/admin');
  }
});

// Index Route
app.get('/links', (req, res) => {
  Linky.find({}, (err, blogs) => {
    if(err){
      console.log(err);
      res.send('opps error')
    } else {
      res.render('index', {blogs: blogs, isSignedIn: isSignedIn});
    }
  });
});

// New Route
app.get('/links/new', (req, res) => {
  if (isSignedIn) {
    res.render('new', {isSignedIn: isSignedIn});
  } else {
    res.render('notlogged', {isSignedIn: isSignedIn});
  }
});

//login route
app.get('/admin', (req, res) => {
  res.render('login', {isSignedIn: isSignedIn, isWrong: isWrong})
  isWrong = false;
});

//logout route
app.get('/logout', (req, res) => {
  isSignedIn = false;
  res.redirect('/links');
})

//verification
app.post('/signin', (req, res, next) => {

  if (req.body.email === email && req.body.password === pass) {
    isSignedIn = true;
    isWrong = false;
    res.redirect('/links');
  } else {
    isSignedIn = false;
    isWrong = true;
    res.redirect('/admin');
  }
  
});

// Create Route
app.post('/links', (req, res) => {
  if (isSignedIn) {
    req.body.blog.desc = req.sanitize(req.body.blog.desc);
    Linky.create(req.body.blog, (err, newBlog) => {
    if(err){
      console.log(err);
      res.render('new');
    } else {
      res.redirect('/links');
    }
  });
  } else {
    res.render('notlogged', {isSignedIn: isSignedIn});
  }
  
});

// Edit Route
app.get('/links/:id/edit', (req, res) => {
  Linky.findById(req.params.id, (err, foundBlog) => {
    if(err){
      res.redirect('/links');
    } else {
      if (isSignedIn) {
        res.render('edit', {blog: foundBlog, isSignedIn: isSignedIn});
      } else {
        res.render('notlogged', {isSignedIn: isSignedIn});
      }
    }
  });
});

// Update Route
app.put('/links/:id', (req, res) => {
  req.body.blog.desc = req.sanitize(req.body.blog.desc);
  console.log(req.body.blog)
  console.log(req.params.id)
  Linky.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
    if(err){
      res.redirect('/links');
      console.log(err)
    } else {
      res.redirect('/links');
    }
  });
});

// Delete Route
app.delete('/links/:id', (req, res) => {
  Linky.findByIdAndRemove(req.params.id, (err) => {
    if(err){
      res.redirect('/links');
    } else {
      res.redirect('/links');
    }
  });
});