
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs   = require('fs');

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

app.get('/', routes.index);
app.get('/users', user.list);

var access = {};

app.get('/rm-tw', function(req, res) {

  var body;
  if ('token' in access && access.token &&
      'secret' in access && acess.secret) {
    body = fs.readFileSync('./public/rm-tw.html', 'utf8');
  } else {
    body = fs.readFileSync('./public/rm-tw-notyet.html', 'utf8');
  }
  res.send(body);
  res.end();

});
app.get('/signin/twitter', require('./twAuth'));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

