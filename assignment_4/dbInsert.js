var fs = require("fs");
var request = require("request");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var _ = require("underscore");

//*******************************************
// Utils
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

                g.day = g.time.split(",")[0];
                g.time = g.time.split(",")[1].trim();
                g.latLong = group.latLong;
                g.formattedLocation = group.formattedLocation;

                return g;
            });
        });

        var collection = _.flatten(allGroups);

        console.log(collection);
        // write file
        fs.writeFileSync('./db_collection.json', JSON.stringify(collection, null, 2) , 'utf-8');

    }
};

var db = {

};

// to visualize the data I will need all meetings for the applicable day and time
// and then have to group again by location

data.readFile("augmented_meetings.json", function(meetings){

    //*******************************************
    // Format meetings for collection insertion
    //*******************************************

    data.format(meetings);

});
