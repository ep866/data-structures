// modules
var request = require('request');
var fs = require('fs');

// utils
var url = 'http://visualizedata.github.io/datastructures/data/m';

function requesting(file) {
    request(url + file + '.html', function(error, response, body){
        if( !error && response.statusCode == 200) {
            console.log('Read file ' + file + ' successfully!');
            fs.writeFileSync('AA-meeting-files/m' + file + '.txt', body);
            console.log('Write ' + file + ' ...');
        } else {
            console.error('request failed!');
        }
    });
}

// make request for the 10 files
for( var i=1; i <= 10; i++ ) {
    if( i < 10 ) {
        requesting('0' + i);
    }else {
        requesting(i);
    }
}

// set server notification
console.log('server is running');
