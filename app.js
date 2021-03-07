var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
require('dotenv').config();

var TWITTER_CONSUMER_KEY =  process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

const url = process.env.URL || process.env.HEROKU_URL;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: url + 'auth/twitter/callback'
},
  function (token, tokenSecret, profile, cb) {
    console.log(token, tokenSecret, profile);
    profile.access_token = token;
    profile.access_token_secret = tokenSecret;
    process.nextTick(function () {
      User.upsert({
        userId: profile._json.id_str,
        username: profile.username,
        photoUrl: profile.photos[0].value
      }).then(() =>{
        cb(null, profile);
      });
    });
  }
));

var indexRouter = require('./routes/index');
var meetingRouter = require('./routes/meeting');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var helpRouter = require('./routes/help');
var settingRouter = require('./routes/setting');

var app = express();
app.use(helmet());

// モデルの読み込み
var User = require('./models/user');
var Meeting = require('./models/meeting');
var Participant = require('./models/participant');
User.sync().then(() => {
  Meeting.belongsTo(User, {foreignKey: 'createdBy'});
  Meeting.sync().then(() => {
    Participant.belongsTo(User, {foreignKey: 'userId', targetKey: 'userId'});
    Participant.belongsTo(Meeting, {foreignKey: 'meetingId', targetKey: 'meetingId'});
    Participant.sync();
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'a85b513ca147b4bd', 
  resave: false,
  saveUninitialized: false
}));
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/meeting', meetingRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/help', helpRouter);
app.use('/setting', settingRouter);

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  if (!err.status) err.status = 500;
  res.status(err.status);
  res.render('error', {
    title: 'SyncMeet - エラー',
    isDevelopment: req.app.get('env') === 'development'
  });
});

module.exports = app;
