var express = require('express');
var router = express.Router();
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var date = require("date-and-time");

router.get('/meetings', function(req, res){

    // db stuff
    var collectionName = "meetings";
    var dbName = "AAmeetings";
    var url = "mongodb://localhost:27017/" + dbName;

        var now = new Date();
        var day = date.format(now, 'dddd');
        var h = date.format(now, 'H');
        var m = date.format(now, 'mm');

        if (h < 10) h = "0" + h;
        var time = h + ":" + m;

        console.log(day, time);

        MongoClient.connect(url, function(err, db) {
            if (err) {return console.dir(err);}

            var collection = db.collection(collectionName);
            var pipe = [{
                $match: { $and: [
                    { day: day },
                    { $or:[
                     { startTime : {$gte: time} },
                     // we have to catch meetings after midnight as well
                     { startTime : {$gte: "00:00", $lt: "05:00"} }
                ]}
                ] }},
                {$sort:{"startTime":1}},
                 { $group: {
                    _id: {
                        latLong: "$latLong",
                        location: "$location",
                        formattedLocation: "$formattedLocation",
                        locationNotes: "$locationNotes"
                    },
                    meetings: {
                        $push:  {
                            group: "$group",
                            type: "$type",
                            startTime: "$startTime",
                            endTime: "$endTime"
                        }
              } } }
                // this is for debugging
                 // { $group: { _id: "$startTime", count: { $sum: 1 } } },
                 //{ $sort : { _id: 1 } }
            ];


            collection.aggregate(pipe).toArray(function(err, docs) {

                if(err) {throw err;}

                // add day and time to collection
                var result = [{when: {"day": day, "atTime": time}, result: docs}];

                db.close();

                res.json(result);

            });

        });


});

module.exports = router;


