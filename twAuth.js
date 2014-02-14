var oauth = new (require('oauth').OAuth)(
    'https://api.twitter.com/oauth/request_token'
  , 'https://api.twitter.com/oauth/access_token'
  , 'dFEZOVuI1tntXiQjEb261A'
  , 'PKaOGcIKCaSrJ8ew1sFl1XFFjG1HjgWph8POyfHz93k'
  , '1.0'
  //, 'http://unddich.herokuapp.com/signin/twitter'
  , 'http://localhost:3000/signin/twitter'
  , 'HMAC-SHA1'
  );

function signin(req, res) {
  var oauth_token    = req.query.oauth_token;
  var oauth_verifier = req.query.oauth_verifier;

  console.log('ok, here we go!!')

  if (oauth_token && oauth_verifier) {
    console.log("##", oauth_token, oauth_verifier);
    oauth.getOAuthAccessToken(
      oauth_token, null, oauth_verifier
      , function(error, oauth_access_token, oauth_access_token_secret, results) {
          if (error) {
            res.send(error, 500);
          } else {
            acess.token = coauth_access_token;
            acces.secret = oauth_access_token_secret;
            res.end(oauth_access_token + " " + oauth_access_token_secret);
            res.redirect('/rm-tw');
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

// ----------------------
module.exports = signin;

