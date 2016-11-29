var express = require('express');
var router = express.Router();
var pg = require("pg");

// connection string
var un = 'elena'; // aws db username
var pw = 'madworld'; // aws db password
var db = 'debatecam'; // aws db database name
var ep = 'debatecam.cc13lkv0cby8.us-west-2.rds.amazonaws.com:5432'; // aws db endpoint
var conString = "postgres://" + un + ":" + pw + "@" + ep + "/" + db;

router.get('/all', function(req, res, next) {
  pg.connect(conString, function(err, client, done){
    if(err) {
      res.json("Error Connecting to Postgres DB");
    }

    var query = "SELECT * FROM debates";

    client.query(query, function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }
        res.json(result);
        console.log("Row count:", result);
    });

  });

});


router.get('/dominant', function(req, res, next) {
  pg.connect(conString, function(err, client, done){
    if(err) {
      res.json("Error Connecting to Postgres DB");
    }

    var query = "SELECT CASE greatest(anger, contempt, disgust, fear, happiness, neutral, sadness, surprise) WHEN anger THEN 'anger' WHEN contempt THEN 'contempt' WHEN disgust THEN 'disgust' WHEN fear THEN 'fear' WHEN happiness THEN 'happiness' WHEN neutral THEN 'neutral' WHEN sadness THEN 'sadness' WHEN surprise THEN 'surprise' END AS Emotion, id, image_name, time_shot_secs, time_shot, who FROM debates";

    client.query(query, function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }
        res.json(result);
        console.log("Row count:", result);
    });

  });

});

var getEmotion = function(res, emotion) {
  pg.connect(conString, function(err, client, done){
    if(err) {
      res.json("Error Connecting to Postgres DB");
    }

    var query = "SELECT who, COUNT(*) as "+emotion+" FROM debates WHERE "+emotion+" > 0.5 GROUP BY who";

    client.query(query, function(err, result) {
        done();
        if(err) {
          return console.error('error running query', err);
        }
        res.json(result);
        console.log("Row count:", result);
    });

  });
}

router.get('/aggregate/anger', function(req, res, next) {
  return getEmotion(res, "anger");
});

router.get('/aggregate/contempt', function(req, res, next) {
  return getEmotion(res, "contempt");
});

router.get('/aggregate/disgust', function(req, res, next) {
  return getEmotion(res, "disgust");
});

router.get('/aggregate/fear', function(req, res, next) {
  return getEmotion(res, "fear");
});

router.get('/aggregate/happiness', function(req, res, next) {
  return getEmotion(res, "happiness");
});

router.get('/aggregate/neutral', function(req, res, next) {
  return getEmotion(res, "neutral");
});

router.get('/aggregate/sadness', function(req, res, next) {
  return getEmotion(res, "sadness");
});

router.get('/aggregate/surprise', function(req, res, next) {
  return getEmotion(res, "surprise");
});



module.exports = router;
