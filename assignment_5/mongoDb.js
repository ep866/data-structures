var fs = require("fs");
var request = require("request");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var _ = require("underscore");

//*******************************************
// Data manipulation
//*******************************************

var utils = {
    timeFormat: function(str) {
        var str = str;
        if( str.toLowerCase() == "noon" ) {str = "12:00 pm"}
        if( str.toLowerCase() == "midnight" ) {str = "12:00 am"}

        var time = str;
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "pm" && hours < 12) hours = hours + 12;
        if (AMPM == "am" && hours == 12) hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        // console.log(sHours + ":" + sMinutes);

        return (sHours + ":" + sMinutes);
    }

};

var data = {
    readFile: function(file, cb) {
        var content = fs.readFileSync(file);

        return cb(JSON.parse(content));
    },

    format: function(data) {

        var allGroups = _.map(data, function(group){

            return _.map(group.meetings, function(thisGroup){

                var g = thisGroup;
                var time = g.time.split(",")[1].trim();
                var startTime = time.split(" to ")[0].trim();
                var endTime = time.split(" to ")[1].trim();

                // save detailed location
                g.fullLocation = g.location;
                // save just the name of the meeting place
                g.location = group.location
                // get day of meeting
                g.day = g.time.split(",")[0];
                // get start time
                g.startTime = utils.timeFormat(startTime);
                // get end time
                g.endTime = utils.timeFormat(endTime);
                // get lat long
                g.latLong = group.latLong;
                // get formatted location
                g.formattedLocation = group.formattedLocation;
                // discard the time key
                delete g.time;

                return g;
            });
        });

        var collection = _.flatten(allGroups);

        // write file
        fs.writeFileSync('./db_collection.json', JSON.stringify(collection, null, 2) , 'utf-8');


        console.log("******************************************");
        console.log("Wrote db_collection.json with formated data");
        console.log("******************************************");

    }
};

//*******************************************
// DB stuff
//*******************************************
var collectionName = "meetings";
var dbName = "AAmeetings";
var url = "mongodb://localhost:27017/" + dbName;

var db = {
    insert: function(data) {
        // console.log(data.length);

        // connect
        MongoClient.connect(url, function(err, db){
            if(err) { return console.log(err); }

            var collection = db.collection(collectionName);

            // insert
            data.forEach(function(meeting, i){
                collection.insert( meeting );
            });

            db.close();
        });
    },
    aggregate: function(testId, nIterations) {

        var datetimeStart = new Date();

        MongoClient.connect(url, function(err, db) {
            if (err) {return console.dir(err);}

            var collection = db.collection(collectionName);
            var pipe = [{
                $match: { $and: [
                    { day: "Tuesday" },
                    { $or:[
                     { startTime : {$gte: "19:00"} },
                     // we have to catch these after midnight as well
                     { startTime : {$gte: "00:00", $lt: "05:00"} }
                ]}
                ] }}
                // these is for debugging
                // { $group: { _id: "$startTime", count: { $sum: 1 } } },
                // { $sort : { _id: 1 } }
            ];


            collection.aggregate(pipe).toArray(function(err, docs) {
                if(err) { console.log(err); }

                profiler.result.push({
                    id: testId,
                    time: new Date() - datetimeStart
                });

                // when the loop ends
                // print in terminal and save result to a json file
                if( testId == nIterations) {
                    console.log(docs);
                    profiler.output(nIterations);
                    db.close();
                }

            });

        });

    }
};

var profiler = {
    result: [],

    test:function(nIterations) {

        for(var i = 1; i <= nIterations; i++) {
            db.aggregate(i,nIterations);
        }

    },
    output: function(nIterations) {
        console.log("******************************************");
        console.log(profiler.result);
        console.log("******************************************");
        // write file
        fs.writeFileSync('./profiler/test_' + nIterations + '_times.json', JSON.stringify(profiler.result, null, 2) , 'utf-8');
    }

};


data.readFile("augmented_meetings.json", function(meetings){

    //*******************************************
    // Format meetings for collection insertion
    //*******************************************

    // data.format(meetings);

});


data.readFile("db_collection.json", function(meetings){

    //*******************************************
    // Now insert the formatted meetings into the DB
    //*******************************************

    // db.insert(meetings);

});



profiler.test(200);









