var fs = require("fs");
var request = require("request");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var _ = require("underscore");

//*******************************************
// Data manipulation
//*******************************************

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
                g.startTime = startTime;
                // get end time
                g.endTime = endTime;
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

var db = {
    insert: function(data) {
        console.log(data.length);

        // mongo url
        var url = "mongodb://localhost:27017/AAmeetings";

        // connect
        MongoClient.connect(url, function(err, db){
            if(err) { return console.log(err); }

            var collection = db.collection("meetings");

            // insert
            data.forEach(function(meeting, i){
                collection.insert( meeting );
            });

            db.close();
        });
    },
    get: function() {
        // to visualize the data I will need all meetings for the applicable day and time
        // and then have to group again by location
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












