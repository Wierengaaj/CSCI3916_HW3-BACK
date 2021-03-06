require('dotenv').config();
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();


router.route('/movies')
// GET ------------------------------------------------------------>
    .get(/* authJwtController.isAuthenticated,  */function(req, res) {
        
        console.log(req.body);

        Movie.find(function (err, movie)
        {
            if (err){
                res.status(500).send(err);
            } else {
                res.status(200).json(movie);
            }
        })
    })
// POST------------------------------------------------------------>
    .post(/* authJwtController.isAuthenticated, */ function(req, res) {
       
        console.log(req.body);

            var movie = new Movie();

            movie.title = req.body.title; // Set the title of the new movie
            
            if(req.body.yearReleased){
                movie.yearReleased = new Date(JSON.stringify(req.body.yearReleased)); // Set the released date of the new movie and make it look nice
            }

            movie.genre = req.body.genre; // Set the genre of the new movie
            movie.actors = req.body.actors; // Set actors of the new movie

            movie.save(function (err){ //Save the movie to the database
                if (err) 
                {
                    if (err.code ==11000)
                        return res.status(400).json({success: false, message: 'duplicate movie'});
                    else
                        return res.status(500).send(err);
                }
                res.status(200).json({success: true, message: 'movie saved'});       
            });
       // }    
    
    })
// PUT------------------------------------------------------------>
    .put(/* authJwtController.isAuthenticated, */ function(req, res) {
        
        console.log(req.body);
        
        Movie.findByIdAndUpdate(req.body.id, req.body, {new:true}, (err,movie) => {
            if(!movie){
                return res.status(400).json({ success: false, message: 'movie not found'});
            }
            if(err)
                return res.status(500).send(err);
            return res.status(200).json({success: true, message: 'movie updated'});
        })
    })
// DELETE------------------------------------------------------------>    
    .delete(/* authJwtController.isAuthenticated,  */function(req, res) {
        
        console.log(req.body);
        
        if(!req.body.id)
        {
            return res.status(400).json({success: fasle, message: 'id field empty'});
        }
        else
        {
            Movie.findByIdAndDelete(req.body.id, (err, todo) => {
                if(!movie) 
                {
                    return res.status(400).json({success: false, message: 'no movie found'})
                }
                if (err)
                    return res.status(500).send(err);
                return res.status(200).json({success: true, message: 'movie deleted'});
            }) 
        }
    })

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res){
        User.find(function (err, users){
            if(err) res.send(err);
            res.json(users);
        })
    })

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res){
        var id = req.params.userId;
        User.findById(id, function(err, user){
            if (err) res.send(err);
            res.json(user);
        });
    })


router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.username = req.body.username;
        newUser.password = req.body.password;
        
        // save the user
        newUser.save(function(err){
            if (err){
                if (err.code === 11000)
                    return res.status(401).json({success: false, message: 'duplicate user'});
                else
                    return res.status(401).send(err);
            }

        res.json({success: true, message: 'user created'});
        })
    }
})

router.post('/signin', function(req, res) {
    var userNew = new User();
    
    console.log(req.body.username);
    console.log(req.body.password);
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        try{
            user.comparePassword(userNew.password, function(isMatch){
                if (isMatch) {
                    var userToken = {id: user._id, username: user.username};
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, message: 'authentication failed.'});
                }
            })
        }
        catch(err){
            res.status(401).send({success: false, message: 'authentication failed; user not known or ' + err.name}) //user not know  for debugging purposes
        }


    });
});

/* router.route('/post')
    .post(authController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObject(req);
            res.json(o);
        }
    );
 */
/* router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );
 */

app.use('/', router);
app.listen(process.env.PORT || 5000);

module.exports = app; // for testing