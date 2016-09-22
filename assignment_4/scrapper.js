// modules
var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var _ = require("underscore");
var $ = null;

var url = "http://meetings.nyintergroup.org/?d=any&v=list";


//*******************************************
// Utility Functions
//*******************************************
var utils = {
    removeTag: function(that, tag) {
        if( $(that).find(tag).length ) {
            $(that).find(tag).remove();
        }
    },
    removeSpace: function(str) {
        return str.replace(/\t|\r/g, '').trim();
    },
    parseHref: function(str) {
        return str.replace(/^(.*[\\\/])/, '').split("?")[0].trim();
    },
    removeBrackets: function(str) {
        return str.replace(/\(([^()]+)\)/g, '');
    },
    cleanString: function(str) {
        return str.replace(/\n/g, ", ").replace("&",", ").replace("#","");
    },
    formatAddress: function(str) {
        // find patterns like 221st StreetQueens and separate
        // street from Borough. Do not split State abbr
        return str.replace(/([a-z])([A-Z])/g, '$1 $2');
    },
    sanitizeAddress: function(str) {
        return  utils.cleanString(utils.formatAddress( utils.removeSpace( utils.removeBrackets( str ) ) ) );
    }
};
//*******************************************
// Parser reads file and extracts entities of choice
//*******************************************
var parser = {
    request: function(url, file) {
        request(url, function(error, response, body){
            if( !error && response.statusCode == 200) {
                console.log('Read url ' + file + ' successfully!');
                fs.writeFileSync('data/' + file + '.txt', body);
                console.log('Write ' + file + ' ...');
            } else {
                console.error('request failed!');
            }
        });
    },
    read: function(file, cb) {
        var content = fs.readFileSync(file);

        return cb(content);
    },
    loadData: function(data, cb) {
        $ = cheerio.load(data);

        return cb(data);
    },
    cacheFiles: function() {
        var meetings = [];

        // get all meetings
        $("#meetings_tbody tr").each(function(i, e){
            var meetingUrl= $(this).find('a').attr('href');

            meetings.push(meetingUrl);

        });

        console.log("******************************************");
        console.log("Start caching...");
        console.log("******************************************");

        // cache each file
        async.eachSeries(meetings, function(url, callback) {

            var meetingName = utils.parseHref( url );

            // check if already cached
            if( fs.existsSync('data/' + meetingName + '.txt') ) {
                console.log('File '+ meetingName +' already exists!');
            } else {
                parser.request(url, meetingName);
            }

            setTimeout(callback, 2000);
        }, function() {
            console.log("******************************************");
            console.log("Cached meeting details files successfully!");
            console.log("******************************************");
        });
    },
    extract: function(data) {

        this.entities.total();
        var meetings = this.entities.meeting();
        var groupMeetings = _.groupBy(meetings, function(meeting){
                        // fix this - not all are in New York
                        // get location, not address
                        // console.log(meeting.details.location);
                        return meeting.details.location;
                    });

        var meetingsByAddress = _.map(groupMeetings, function(group){
            return {
                sanitizedAddress: group[0].details.location,
                address: group[0].address,
                location: group[0].location,
                meeting: group[0].meeting,
                type: group[0].type,
                region: group[0].region,
                meetings: _.pluck(group, 'details')
            }
        });

        console.log("******************************************");
        console.log('Unique locations: ', meetingsByAddress.length);
        console.log("******************************************");


        // write file
        fs.writeFileSync('./all_meetings.json', JSON.stringify(meetingsByAddress, null, 2) , 'utf-8');

    },
    augmentData: function() {
        var apiKey = process.env.GMAKEY;
        var augmentedMeetings = [];

        parser.read('all_meetings.json', function(meetings) {
            var meetings = JSON.parse(meetings);
            var uniqueLocations = meetings.length;
            var apiLimit = 2000;
            var count = 1;

            console.log("******************************************");
            console.log('Unique locations: ', uniqueLocations);
            console.log("******************************************");

            if( uniqueLocations < apiLimit ) {
                console.log("******************************************");
                console.log('Start augmenting the data with Google API');
                console.log("******************************************");

                async.eachSeries(meetings, function(meeting, callback){
                    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + meeting.sanitizedAddress.split(' ').join('+').replace(',','') + '&key=' + apiKey;

                    request(apiRequest, function(err, resp, body) {
                        if (err) {throw err;}

                        var result = JSON.parse(body);

                        if(!result.error_message && result.status == "OK") {
                            // write the lat and long
                            meeting.latLong = result.results[0].geometry.location;
                            // write formatted address
                            meeting.formattedLocation = result.results[0].formatted_address;
                        } else {

                            meeting.latLong = null;
                            meeting.formattedLocation = null;

                            console.log("******************************************");
                            console.log('MAPS api error on ', count, ' ' , meeting.meeting);
                            console.log("******************************************");
                        }

                        // rebuild the JSON file
                        augmentedMeetings.push(meeting);

                        console.log("******************************************");
                        console.log('Augment meeting ', count, ' ' , meeting.meeting);
                        console.log("******************************************");
                        count++; // keep track of meetings for debugging
                    });

                setTimeout(callback, 2000);

                }, function() {
                    console.log("******************************************");
                    console.log('Successfully augmented the data');
                    console.log("******************************************");
                    // on completion write out the augmented data in a json file
                    fs.writeFileSync('./augmented_meetings.json', JSON.stringify(augmentedMeetings, null, 2) , 'utf-8');
                });


            } else {
                console.log("******************************************");
                console.log('Too Many Unique Locations for Google API');
                console.log("******************************************");
            }

        });

    },

    meetingsStats: function() {
        // check if all detail addresses are the same in all_meetings data
        parser.read("all_meetings.json", function(meetings){
            var allMeetings = JSON.parse(meetings);

            var countMeetingPerLocation = _.map(allMeetings,function(x){
                return _.countBy(x.meetings, "location");
            });

            countMeetingPerLocation = _.map(countMeetingPerLocation, function(location){


                 return _.map(location, function(value, key){

                    return {
                        location: key,
                        count: value
                    };

                });

            });

            var sorted = _.sortBy( _.flatten(countMeetingPerLocation), "count" );

            sorted = sorted.reverse();

            fs.writeFileSync('./meetings_stats.json', JSON.stringify(sorted, null, 2) , 'utf-8');

        });

        console.log('Successfully wrote stats file!');
    }

};

//*******************************************
// Define entities to be extracted
//*******************************************
parser.entities = {
    total: function() {
        console.log('*****************************');
        console.log("Total number of meetings: ",
            $("#meetings_tbody tr").length);
        console.log('*****************************');
    },
    meeting: function() {
        // for each row
        var output = [];

        $("#meetings_tbody tr").each(function(i, e){
            var meetingDetails = $(this).find('a').attr('href');
            var meetingName = utils.parseHref( meetingDetails );
            var details = {};

            // load details file
            parser.read('cachedFiles/' + meetingName + '.txt', function(meetingDetails){
                var $ = cheerio.load(meetingDetails);
                // grab meeting details
                details = parser.entities.meetingDetails($);
            });

            // grab the first level meeting data
            output.push({
                time: utils.removeSpace( $(this).find('.time').text() ),
                meeting: utils.removeSpace( $(this).find('.name').text() ),
                location: utils.removeSpace( $(this).find('.location').text() ),
                address: utils.removeSpace( $(this).find('.address').text() ),
                region: utils.removeSpace( $(this).find('.region').text() ),
                type: utils.removeSpace( $(this).find('.types').text() ),
                details: details
            });

            console.log('*****************************');
            console.log("Extract meeting ", i, ': ', meetingName);
            console.log('*****************************');

        });


        //console.log(output);
        return output;
    },
    meetingDetails: function($) {
        var output = {};

        $('#meeting dl dt').each(function(i,e){
            if( $(this).text() == 'Time' ) {
                output.time = utils.removeSpace( $(this).next().text() );
            }
            if( $(this).text() == 'Location' ) {
                output.location = utils.sanitizeAddress( $(this).next().text() );
            }
            if( $(this).text() == 'Group' ) {
                output.group = utils.removeSpace( $(this).next().text() );
            }
            if( $(this).text() == 'Region' ) {
                output.region = utils.removeSpace( $(this).next().text() );
            }
            if( $(this).text() == 'Type' ) {
                output.type = utils.removeSpace( $(this).next().text() );
            }
            if( $(this).text() == 'Meeting Notes' ) {
                output.meetingNotes = utils.removeSpace( $(this).next().text() );
            }
            if( $(this).text() == 'Location Notes' ) {
                output.locationNotes = utils.removeSpace( $(this).next().text() );
            }
            if( $(this).text() == 'Last Contact Date' ) {
                output.lastContact = utils.removeSpace( $(this).next().text() );
            }
        });

        return output;
    }
};


//*******************************************
// Run this once to cache all meetings
//*******************************************
// parser.request(url, 'meetings');

parser.read("cachedFiles/meetings.txt", function(html) {

    parser.loadData(html, function(meetings){
        //*******************************************
        // Run this once to cache all meetings details
        // This takes about 2 hours to complete
        //*******************************************

        // parser.cacheFiles(meetings);

        //*******************************************
        // Extract data: 1013 unique locations for 3,652 meetings
        //*******************************************

        // parser.extract(meetings);

        //*******************************************
        // Get stats on number of meetings per location
        //*******************************************
        // parser.meetingsStats();

        //*******************************************
        // Augment data
        //*******************************************

        // parser.augmentData();


    });

});

console.log("server is running!");
