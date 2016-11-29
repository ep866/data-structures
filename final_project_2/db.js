var pg = require('pg');
var fs = require('fs');

// connection string
var un = 'elena'; // aws db username
var pw = 'madworld'; // aws db password
var db = 'debatecam'; // aws db database name
var ep = 'debatecam.cc13lkv0cby8.us-west-2.rds.amazonaws.com:5432'; // aws db endpoint
var conString = "postgres://" + un + ":" + pw + "@" + ep + "/" + db;


// dateCreated timestamp DEFAULT current_timestamp
var createTableQuery = "CREATE TABLE debates (id smallint, image_name varchar(500), image_link varchar(1500), date_debate date, is_double_shot boolean, time_shot_secs smallint, time_shot varchar(30), who varchar(100), anger decimal(5,2), contempt decimal(5,2), disgust decimal(5,2), fear decimal(5,2), happiness decimal(5,2), neutral decimal(5,2), sadness decimal(5,2), surprise decimal(5,2));"


var db = {
    createTable: function() {
        pg.connect(conString, function(err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }

            client.query(createTableQuery, function(err, result) {
                //call `done()` to release the client back to the pool
                done();

                if (err) {
                    return console.error('error running query', err);
                }

                console.log(result);

            });

        });
    },

    insert: function(file, debateDate) {
        var data = JSON.parse( fs.readFileSync("metadata/" + file) );
        var s3 = "https://s3-us-west-2.amazonaws.com/debates2016/Oct2016/DebatesShotsResized/"
        var query = function(client, vals, done) {
            client.query(vals, function(err, result) {
                done();
                if(err) {
                  return console.error('error running query', err);
                }
                console.log("inserted all rows!");
            });
        }

        // connect to db
        pg.connect(conString, function(err, client, done) {
          if(err) {
            return console.error('error fetching client from pool', err);
          }

          var inserts = [  ];

            // parse dataset
            data.forEach(function(d) {

                if(d.sentiment.length == 1) {

                    var link = d.isDouble ? d.location.split("/")[3] : d.location.split("/")[2];

                    inserts.push([d.id + "', '" + d.img + "', '" + (s3+link) + "', '" + debateDate + "', '" + d.isDouble + "', '" + d.sec + "', '" + d.time + "', '" + d.who + "', '" + d.sentiment[0].scores.anger + "', '" + d.sentiment[0].scores.contempt + "', '" + d.sentiment[0].scores.disgust + "', '" + d.sentiment[0].scores.fear + "', '" + d.sentiment[0].scores.happiness + "', '" + d.sentiment[0].scores.neutral + "', '" + d.sentiment[0].scores.sadness + "', '" + d.sentiment[0].scores.surprise]);

                    // query(client, insertQuery, done);

                } else {
                    // for those with more than one person in the pic - 433 images in total
                    var link = d.isDouble ? d.location.split("/")[3] : d.location.split("/")[2];
                    // record the sentiment of each person
                    d.sentiment.forEach(function(s) {
                        inserts.push([d.id + "', '" + d.img + "', '" + (s3+link) + "', '" + debateDate + "', '" + d.isDouble + "', '" + d.sec + "', '" + d.time + "', '" + d.who + "', '" + s.scores.anger + "', '" + s.scores.contempt + "', '" + s.scores.disgust + "', '" + s.scores.fear + "', '" + s.scores.happiness + "', '" + s.scores.neutral + "', '" + s.scores.sadness + "', '" + s.scores.surprise]);

                    //   query(client, insertQuery, done);
                    });

                }
            }); //data each

        var vals = JSON.stringify(inserts);
        vals = vals.replace(/\[/g,"(").replace(/\]/g,")").replace(/"/g,'\'').replace(/'null'/g, null).slice(1,-1);

        var insertQuery = "INSERT INTO debates VALUES" + vals
        query(client, insertQuery, done);

        // console.log(vals)

      }); //db connect

    },
    query: function() {
        // connect to db
        pg.connect(conString, function(err, client, done) {
          if(err) {
            return console.error('error fetching client from pool', err);
          }

        var check = "SELECT COUNT(*) AS nRows FROM debates";
        var deleted = "DELETE FROM debates";

            client.query(check, function(err, result) {
                done();
                if(err) {
                  return console.error('error running query', err);
                }
                console.log("Row count:", result)
            });

        });

    }
};

// db.createTable();
// db.insert( "finalDataset.json", "2016-10-19");
db.query()




