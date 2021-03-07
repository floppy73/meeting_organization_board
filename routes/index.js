var express = require('express');
var router = express.Router();
const Meeting = require('../models/meeting');
const User = require('../models/user');
const Participant = require('../models/participant');
const authenticationEnsurer = require('./authentication-ensurer');

const Sequelize = require('sequelize');
const op = Sequelize.Op;

const showMeetingNum = 12;

/* GET home page. */
router.get('/', authenticationEnsurer, function(req, res, next) {
  const date = new Date();
  const today = fetchDate(date);
  const pageNum = parseInt(req.query.page) || 1;

  const period = parseInt(req.query.period) || 36500;
  date.setDate(date.getDate() + period);
  const limit = fetchDate(date);
  
  Meeting.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'username', 'photoUrl', 'playerName']
      }],
    where: {
      date: {
        [op.gte]: today,
        [op.lte]: limit
      }
    },
    order: [['date', 'ASC']],
    offset: (pageNum - 1) * showMeetingNum,
    limit: showMeetingNum
  }).then((meetings) => {
    res.render('index', {
      title: 'SyncMeet - Home',
      Meetings: meetings.rows,
      isHome: true,
      pageNum: pageNum,
      maxPageNum: meetings.count === 0 ? 1 : Math.ceil(meetings.count / showMeetingNum)
    });
  });
});

router.get('/mymeeting', authenticationEnsurer, function(req, res, next) {
  const userId = req.session.passport.user._json.id_str;
  const today = fetchDate(new Date());
  Participant.findAll({
    where: {
      userId: userId,
      status: { [op.ne]: 0 }
    }
  }).then((p) => {
    const ids = [];
    for (key in p) {
      ids.push(p[key].meetingId);
    }
    console.log(ids);
    Meeting.findAll({
      include: [{
        model: User,
        attributes: ['userId', 'username', 'photoUrl', 'playerName']
      }],
      where: {
        meetingId: {
          [op.in]: ids
        },
        date: {
          [op.gte]: today
        }
      }
    }).then((meetings) => {
      res.render('index', {
        title: 'SyncMeet - 参加表明中のミーティング',
        Meetings: meetings
      });
    });
  });
});

const fetchDate = (date) => {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return year + '-' + month + '-' + day;
}

module.exports = router;
