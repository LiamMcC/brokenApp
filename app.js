var express = require("express"); // This line calls the express module
var app = express(); //invoke express application
var mysql = require('mysql'); // allow access to sql
var flash    = require('connect-flash');
// Passport
var passport = require('passport');

const fileUpload = require('express-fileupload');
app.use(fileUpload());
//var myObj = { "name":"John"};    // set a json object to represent the cart I called it myObject


var LocalStrategy = require('passport-local').Strategy;
var localStorage = require('node-localstorage')
var session  = require('express-session');
var cookieParser = require('cookie-parser');

// Create a table called users with autoincrement id username and password fields as a mnimum


var bcrypt = require('bcrypt-nodejs');

app.use(cookieParser()); // read cookies (needed for auth)


// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
//require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});



// Call and use body parser the next two lines are needed
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



// we need some way for the app to know where to look for views
app.use(express.static("views"));

// we need some way for the app to know where to look for scripts
app.use(express.static("script"));

// we need some way for the app to know where to look for images
app.use(express.static("images"));

// Set the default view engine
app.set("view engine", "ejs");








// ******************** SQL Connection ********************************** //
// https://mysqladmin.webapps.net/phpmyadmin/pma3/index.php?db=liam&server=304&token=fcb8db215553e6e54251aacbeb00df9f

var db = mysql.createPool({
 
  host: 'den1.mysql1.gear.host',
 user: 'nci',
 password: 'Yo7A_B09i4?1',
 database: 'nci'
  
 
});

db.getConnection((err,connection)=> {
  if(err)
  throw err;
  console.log('Database connected successfully');
  connection.release();
});

// db.connect((err) =>{
//  if(err){
//   console.log("Connection Refused ... Please check login details");
//    // throw(err)
//  }
//  else{
//   console.log("Well done you are connected....");
//  }
// });

// ******************** End SQL Connection ********************************** //



// app.get('/alter', function(req, res){
 //let sql = 'ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT FALSE;'
 // let query = db.query(sql, (err, res) => {
  //  if(err) throw err;
//    console.log(res);
    
    
 // });
 // res.send("altered");
 // });







// Set up a page that jsut says something 
app.get("/", function(req, res){
    
   // res.send("This is the best class ever");
    res.render("index");
    
    console.log('Cookies: ', req.cookies);
});



// Render products page

app.get('/reviews',  function(req, res){  // I have this restricted for admin just for proof of concept
 let sql = 'SELECT * FROM reviews'
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);

    res.render('products', {res1});
  });
 
  console.log("Now you are on the products page!");
});



app.get('/users',  function(req, res){  // I have this restricted for admin just for proof of concept
  let sql = 'SELECT * FROM users'
   let query = db.query(sql, (err, res1) => {
     if(err) throw err;
     console.log(res1);
 
     res.render('users', {res1});
   });
  
   console.log("Now you are on the products page!");
 });


app.get('/add', isLoggedIn, function(req, res){
  var who = req.user.ulevel


  console.log(who)

  if (who === "normal") {

    res.redirect('/profile')
  }
else {

    
  }
  res.render('add', {
    user : req.user // get the user out of session and pass to template
  });
  console.log("Now you are on the products page!");
});


app.get('/upgrade/:id', function(req, res){
  let sql = 'UPDATE users SET ulevel = "admin" WHERE id = "'+req.params.id+'";'
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    
    
  });
  res.redirect("/products");
  });

// ***** Post new product to database

app.post('/add', function(req, res){

  let sampleFile = req.files.sampleFile
  filename = sampleFile.name;
 // we use the middleware (file upload ) to move the data from the form to the desired location
    sampleFile.mv('./images/' + filename, function(err){
        if(err)
      
        return res.status(500).send(err);
        
        console.log("Image is " + req.files.sampleFile)
        
        //res.redirect('/');
        
    });




  var who = req.user.username
  let sql = 'INSERT INTO reviews (username, review, eventName, image) VALUES ("'+who+'", "'+req.body.review+'", "'+req.body.eventName+'", "'+filename+'")'
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    
    
  });
  res.redirect("/reviews");
  });


// Edit product

app.get('/edit/:id', function(req, res){
    let sql = 'SELECT * FROM reviews WHERE Id = "'+req.params.id+'" ; ';
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res);
    
    res.render('edit', {res1}); // This will render the index.jade page for us
  });
  
    //res.send("Hello Lovely World"); // send the response as a string Hello World
    console.log("That worked");
    
});




// ***** Post new product to database

app.post('/edit/:id', function(req, res){
  let sql = 'UPDATE reviews SET eventName = "'+req.body.eventName+'", review = "'+req.body.review+'", image = "'+req.body.image+'" WHERE id = "'+req.params.id+'";'
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    
    
  });
  res.redirect("/reviews");
  });


// Delete product

app.get('/delete/:id',  function(req, res){
    let sql = 'DELETE FROM Products WHERE Id = "'+req.params.id+'" ; ';
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res);
    
    res.redirect('/products'); // This will render the index.jade page for us
  });
  
    //res.send("Hello Lovely World"); // send the response as a string Hello World
    console.log("That worked");
    
});

// --------------------------------------------------------- Authenthication ------------------------------------------------------------ //

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.get('/editprofile', isLoggedIn, function(req, res) {
		res.render('editprofile', {
			user : req.user // get the user out of session and pass to template
		});
	});


  app.post('/editprofile', function(req, res){
    var passwordN = bcrypt.hashSync(req.body.password, null, null)
    let sql = 'UPDATE users SET username = "'+req.body.username+'", password = "'+passwordN+'", email = "'+req.body.email+'" WHERE id = "'+req.user.id+'";'
    let query = db.query(sql, (err, res) => {
      if(err) throw err;
      console.log(res);
      
      
    });
    res.redirect("/products");
    });


  //bcrypt.hashSync(password, null, null)

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}


// see are they admin
function isAdmin(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.user.admin)
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}




//module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id); // Very important to ensure the case if the Id from your database table is the same as it is here
    });

    // used to deserialize the 
    passport.deserializeUser(function(Id, done) {    // LOCAL SIGNUP ============================================================

       db.query("SELECT * FROM users WHERE Id = ? ",[Id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

  passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            db.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        email: req.body.email,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( username, email, password, ulevel ) values (?,?,?, 'normal')";

                    db.query(insertQuery,[newUserMysql.username, newUserMysql.email, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
//};





    
    
      






// Now we need to tell the application where to run


app.listen(process.env.PORT || 80, process.env.IP || "0.0.0.0", function(){
  console.log("Off we go again");
  
})
