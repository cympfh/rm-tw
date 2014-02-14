/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs   = require('fs');

var oauth = new (require('oauth').OAuth)(
    'https://api.twitter.com/oauth/request_token'
  , 'https://api.twitter.com/oauth/access_token'
  , 'dFEZOVuI1tntXiQjEb261A'
  , 'PKaOGcIKCaSrJ8ew1sFl1XFFjG1HjgWph8POyfHz93k'
  , '1.0'
  , 'http://unddich.herokuapp.com/signin/twitter'
  // , 'http://localhost:3000/signin/twitter'
  , 'HMAC-SHA1'
  );

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);

var access = {};

// app.get('/', routes.index);
app.get('/', function(req, res) {

  var verified = true;

  if ('token' in access && access.token &&
      'secret' in access && access.secret) { // 認証済み
    rm_tw_work(access.token, access.secret);

    // delete access_ token and secret
    access = {};
  }
  else {
    verified = false;
  }

  var body =
    fs.readFileSync(verified? './rm-tw/index.html' : './rm-tw/index0.html', 'utf8');
  res.send(body);
  res.end();

});
app.get('/signin/twitter', signin);
function signin(req, res) {
  var oauth_token    = req.query.oauth_token;
  var oauth_verifier = req.query.oauth_verifier;

  if (oauth_token && oauth_verifier) {
    console.log("##", oauth_token, oauth_verifier);
    oauth.getOAuthAccessToken(
      oauth_token, null, oauth_verifier
      , function(error, oauth_access_token, oauth_access_token_secret, results) {
          if (error) {
            res.send(error, 500);
          } else {
            access.token =  oauth_access_token;
            access.secret = oauth_access_token_secret;
            // res.end('success: ' + oauth_access_token + " " + oauth_access_token_secret);
            res.redirect('/');
          }
        });
    } else {
      oauth.getOAuthRequestToken(
        function(error, oauth_token, oauth_token_secret, results) {
          if (error) {
            res.send(error, 500);
          } else {
            req.session = {
              oauth_token: oauth_token,
              oauth_token_secret: oauth_token_secret,
              request_token_results: results
            };
            res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
          }
        });
      }
}

var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// ----------------

var tws = {};

var ntwitter = require('ntwitter');
function rm_tw_work(token, secret) {
  var tw = new ntwitter(
    {
        "consumer_key":     'dFEZOVuI1tntXiQjEb261A'
      , "consumer_secret":  'PKaOGcIKCaSrJ8ew1sFl1XFFjG1HjgWph8POyfHz93k'
      , "access_token_key":    token
      , "access_token_secret": secret
    });
  var so;

  function polling() {
    if (last_so) get_tweet();
    else setTimeout(polling, 500);
  }
  setTimeout(polling, 3000);

  function get_tweet() {
    var so = last_so;
    last_so = null;
    cons.push({ tw: tw, so: so });
    var url = "https://api.twitter.com/1.1/statuses/user_timeline.json";
    tw.get(url, {count : 20}
              , function(er, data) {
                  data = data.map(function(d) {
                    return d.text
                            .replace(/&lt;/g, "<")
                            .replace(/&gt;/g, ">")
                            .replace(/&amp;/g, "&")
                  });
                  so.emit("new", data);
              });
  }
}


var io = require('socket.io').listen(server);

io.configure(function() { 
    io.set("transports", ["xhr-polling"]); 
      io.set("polling duration", 10); 
});

io.sockets.on("connection", function(socket) {
  var ip = socket.handshake.address.address;
  console.log('### socket connect', ip);
  last_so = socket;
  socket.emit("new", [ip]);
});
