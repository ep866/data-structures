// modules
var fs = require("fs");
var cheerio = require("cheerio");
var $ = null;


//*******************************************
// Utility Functions
//*******************************************

var utils = {
    removeTag: function(that, tag) {
        if( $(that).find(tag).length ) {
            $(that).find(tag).remove();
        }
    }
};


//*******************************************
// Parser reads file and extracts entities of choice
//*******************************************

var parser = {
    read: function(file, cb) {
        var content = fs.readFileSync(file);

        return cb(content);
    },
    extract: function(data) {
        $ = cheerio.load(data);

        this.entities.total();
        this.entities.address();

    }
};

//*******************************************
// Define entities to be extracted
// This is the base assignment with address only
//*******************************************

parser.entities = {
    total: function() {
        console.log('*****************************');
        console.log("Total number of meetings: ",
            $("table table table tr").length);
        console.log('*****************************');
    },
    address: function() {
        // for each row
        $("table table table tr").each(function(i, e){

            // get first cell
            $(e).children().first().each(function(j, e){
                // clean up output
                utils.removeTag(this, "br");
                utils.removeTag(this, "b");
                utils.removeTag(this, "span");
                utils.removeTag(this, "div");
                utils.removeTag(this, "h4");
                // print address
                console.log($(e).text().replace(/\t|\r|\n/g, ''));
            });
            console.log('---------------------------------------------------------------');
            console.log('Address for location:', i+1);
        });
    }
};


parser.read("AA-meeting-files/m01.txt", function(data) {
    parser.extract(data);
});

console.log("server is running!");
