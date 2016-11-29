var fs = require("fs");
var request = require("request");
var _ = require("underscore");
var date = require("date-and-time");

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
    },
    textFormat: function(str) {
        var note = /NOTE(.*)/ig;
        var GroupN = /\(.*/ig;

        console.log("******* Meeting Name *************");
        console.log("\n")
        console.log("WAS: ", str)

        if(str) {
            return str.replace(note, "")
                    .replace(/\n/ig, " ")
                    .replace(GroupN, "");
        }

    }

};

//*******************************************
// Prep data for MongoDB insert
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

                // name of group
                g.group = utils.textFormat(g.group);
                console.log("\n");
                console.log("IS NOW: ", g.group)
                console.log("\n");
                console.log("**********************************");

                // save detailed location
                g.fullLocation = g.location;
                // save just the name of the meeting place
                g.location = group.location;
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

        // write file to be inserted
        fs.writeFileSync('processed_data/db_collection.json', JSON.stringify(collection, null, 2) , 'utf-8');


        console.log("******************************************");
        console.log("Wrote db_collection.json with formated data");
        console.log("******************************************");

    }
};

data.readFile("processed_data/augmented_meetings.json", function(meetings){

    //*******************************************
    // Format meetings for collection insertion
    //*******************************************

    data.format(meetings);

});


