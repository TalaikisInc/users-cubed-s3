import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'

import { social } from '../../config'

passport.serializeUser(function(user, done) {
  done(null, user._id);
})

passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user){
      console.log(user);
        if(!err) done(null, user);
        else done(err, null);
      });
})

module.exports = passport.use(new FacebookStrategy({
  clientID: social.facebook.clientID,
  clientSecret: social.facebook.clientSecret,
  callbackURL: social.facebook.callbackURL
}, (accessToken, refreshToken, profile, done) => {
      User.findOne({ oauthID: profile.id }, function(err, user) {
        if(err) {
          console.log(err);  // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new User({
            oauthID: profile.id,
            name: profile.displayName,
            created: Date.now()
          });
          user.save(function(err) {
            if(err) {
              console.log(err);  // handle errors!
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
      });
    }
  ));
  
  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: config.twitter.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ oauthID: profile.id }, function(err, user) {
        if(err) {
          console.log(err);  // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new User({
            oauthID: profile.id,
            name: profile.displayName,
            created: Date.now()
          });
          user.save(function(err) {
            if(err) {
              console.log(err);  // handle errors!
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
      });
    }
  ));

  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
    },
    function(request, accessToken, refreshToken, profile, done) {
      User.findOne({ oauthID: profile.id }, function(err, user) {
        if(err) {
          console.log(err);  // handle errors!
        }
        if (!err && user !== null) {
          done(null, user);
        } else {
          user = new User({
            oauthID: profile.id,
            name: profile.displayName,
            created: Date.now()
          });
          user.save(function(err) {
            if(err) {
              console.log(err);  // handle errors!
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
      });
    }
  ));
