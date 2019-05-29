"use strict";

var express = require("express");
var passport = require("passport"); // middleware
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var config = require("./config");
// ------------- requirements

var app = express();
var googleProfile = {};

// ----- Pug
app.set("view engine", "pug");
app.set("views", "./views");
// ----- Passport
app.use(passport.initialize());
app.use(passport.session());
// ----- css styles
app.use(express.static("css"));

// ----- serialize and deserialize user
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// ----- passport: instance of Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
      googleProfile = {
        id: profile.id,
        displayName: profile.displayName
      };
      cb(null, profile);
    }
  )
);

// ----- app routes
app.get("/", function(req, res) {
  res.render("index.pug", { user: req.user });
});
app.get("/logged", function(req, res) {
  res.render("logged.pug", { user: googleProfile });
});

// ----- Passport routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/logged",
    failureRedirect: "/"
  })
);

// ------ handling 404
app.use(function(req, res, next) {
  res
    .status(404)
    .send("Not what you've been looking for but still I love U 3000");
});

// ----- server ------------------------------------------------------------------
var server = app.listen(3000, "localhost", function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("App listening on http://" + host + ":" + port);
});
