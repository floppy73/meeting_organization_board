'use strict';
var express = require('express');
var router = express.Router();
const uuid = require('uuid');
const Meeting = require('../models/meeting');
const User = require('../models/user');
const Participant = require('../models/participant');
const authenticationEnsurer = require('./authentication-ensurer');
const Tokens = require('csrf');
const tokens = new Tokens();
const twitter = require('twitter');
require('dotenv').config();

const url = process.env.URL || process.env.HEROKU_URL;

/* GET users listing. */
router.get('/new', authenticationEnsurer, function(req, res, next) {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  req.session._csrf = secret;

  res.render('new', {
    title: 'SyncMeet - ミーティング新規作成',
    csrfToken: token
  });
});

router.get('/:meetingId', authenticationEnsurer, async function(req, res, next) {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  req.session._csrf = secret;

  const meetingId = req.params.meetingId;
  const userId = req.session.passport.user._json.id_str;

  const meeting = await Meeting.findOne({
    include: [{
        model: User,
        attributes: ['userId', 'username', 'photoUrl', 'playerName']
      }],
    where: {
      meetingId: meetingId
    }
  });

  if(!meeting) {
    const err = new Error('指定されたミーティングは存在しないか、終了しています。');
    err.status = 404;
    next(err);
  }

  const ifVisible = await checkIfVisible(meeting, req);
  if(ifVisible) {
    Participant.findAll({
    include: [{
      model: User,
      attributes: ['userId', 'username', 'photoUrl', 'playerName']
    }],
    where: { meetingId: meetingId }
    }).then((participants) => {
    res.render('meeting', {
      title: 'SyncMeet - ミーティング詳細',
      Meeting: meeting,
      goMember: participants.filter(p => p.status === 2),
      maybeGoMember: participants.filter(p => p.status === 1),
      isSelf: isSelf(req, meeting),
      doesUserContained: participants.some(p => p.userId === userId && !(p.status === 0)),
      doesCreatorContained: participants.some(p => p.userId === meeting.createdBy && !(p.status === 0)),
      csrfToken: token
      })
    });
  } else {
    const err = new Error('このミーティングは主催者をフォローしている場合見ることができます。');
    err.status = 404;
    next(err);
  }
});

function checkIfVisible(meeting, req) {
  return new Promise(function(resolve, reject) {
    if (!meeting.isPrivate) {
      resolve(true);
    } else {
      Participant.findOne({
        where: {
          meetingId: meeting.meetingId,
          userId: req.session.passport.user._json.id_str
        }
      }).then((user) => {
        if(user) {
          resolve(true);
        } else {
          const client = new twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token_key: req.session.passport.user.access_token,
            access_token_secret: req.session.passport.user.access_token_secret
          });
          client.get('friends/ids', {
            user_id: req.session.passport.user._json.id_str.toString(),
            stringify_ids: true
          }, function (err, friends, response) {
            const friends_ids = friends.ids;
            resolve(
              friends_ids.includes(meeting.createdBy)
            );
          })
        }
      })
    }
  })
}

router.post('/', authenticationEnsurer, function(req, res, next) {
  console.log(req.body); // TODO:消す

  const secret = req.session._csrf;
  const token = req.body._csrf;

  if (tokens.verify(secret, token) === false) {
    throw new Error('Invalied Token');
  }

  const meetingId = uuid.v4();
  Meeting.create({
    meetingId: meetingId,
    location: req.body.location.slice(0, 255),
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    comment: req.body.comment,
    createdBy: req.session.passport.user._json.id_str,
    isPrivate: req.body.isPrivate ? true : false
  }).then(()=> {
    if (req.body.ifShare) {
      const client = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: req.session.passport.user.access_token,
        access_token_secret: req.session.passport.user.access_token_secret
      });
      client.post('statuses/update', {
        status: req.body.location + 'でシンクロニカしませんか？\n' + url + 'meeting/' + meetingId
      },
      function(error, tweet, response) {
        if (!error) {
          console.log(tweet)
        }
      });
    }
    Participant.create({
      meetingId: meetingId,
      userId: req.session.passport.user._json.id_str,
      status: 2
    })
  }).then(() => {
    delete req.session._csrf;
    res.redirect('/');
  });
});

router.post('/:meetingId/delete', authenticationEnsurer, function(req, res, next) {
  const secret = req.session._csrf;
  const token = req.body._csrf;

  if (tokens.verify(secret, token) === false) {
    throw new Error('Invalied Token');
  }

  Meeting.findOne({
    where: { meetingId: req.params.meetingId }
  }).then((meeting) => {
    if (isSelf(req, meeting)) {
      Participant.destroy({
        where: { meetingId: meeting.meetingId }
      }).then(() => {
        Meeting.destroy({
          where: { meetingId: meeting.meetingId }
        }).then(() => {
          delete req.session._csrf;
          res.redirect('/');
        });
      });
    } else {
      const err = new Error('指定されたミーティングがないか、削除する権限がありません。');
      err.status = 404;
      next(err);
    }
  });
});

router.post('/:meetingId/status/:participantStatus', authenticationEnsurer, function(req, res, next) {
  const secret = req.session._csrf;
  const token = req.body._csrf;

  if (tokens.verify(secret, token) === false) {
    throw new Error("Invailed token");
  }

  const meetingId = req.params.meetingId;
  const user = req.session.passport.user._json.id_str;
  const status = parseInt(req.params.participantStatus);
  Participant.upsert({
    meetingId: meetingId,
    userId: user,
    status: status
  }).then(() => {
    delete req.session._csrf;
    res.redirect(`/meeting/${meetingId}`);
  });
});

function isSelf(req, meeting) {
  return  meeting && meeting.createdBy === req.session.passport.user._json.id_str;
}

module.exports = router;
