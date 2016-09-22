var fs = require("fs");
var request = require("request");
var mongodb = require("mongodb");


//*******************************************
// Utils
//*******************************************

var data = {
    readFile: function(file, cb) {
        var content = fs.readFileSync(file);

        return cb(JSON.parse(content));
    },

    format: function(data) {

    }
};

var db = {

};


data.readFile("augmented_meetings.json", function(meetings){

    //*******************************************
    // Format meetings for collection insertion
    //*******************************************

    data.format(meetings);

});
