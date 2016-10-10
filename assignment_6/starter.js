// IN THE MONGO SHELL:
//   CREATE DATABASE citibike AND SWITCH TO IT WITH:
//      use citibike
//   CREATE COLLECTION stations WITH:
//      db.createCollection('stations')
//   QUERY THE ENTIRE stations COLLECTION WITH:
//      db.stations.find()
//   COUNT THE NUMBER OF DOCUMENTS IN THE stations COLLECTION WITH:
//      db.stations.find().count()

var request = require('request');


var dbName = 'citibike';
var collName = 'stations';


// Connection URL
var url = 'mongodb://localhost:27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb



function instert() {
    request('https://www.citibikenyc.com/stations/json', function(error, response, body) {
        var stationData = JSON.parse(body);

        MongoClient.connect(url, function(err, db) {
            if (err) {return console.dir(err);}

            var collection = db.collection(collName);

            // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
            for (var i=0; i < stationData.stationBeanList.length; i++) {
                collection.insert(stationData.stationBeanList[i]);
                }
            db.close();

        }); //MongoClient.connect

    }); //request
}


var times = [];

function aggregated(i) {
    // QUERY MONGODB

    var datetimeStart = new Date();


    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}

        var collection = db.collection(collName);

        collection.aggregate([{ $limit : 3 }]).toArray(function(err, docs) {
            if(err) {
                console.log(err)
            } else {
               console.log(docs);
            }

            db.close();

            times.push({
                id: i,
                time: new Date() - datetimeStart
            });
console.log("****************************");
console.log(times);
console.log("****************************");
            // console.log("This process completed in", new Date() - datetimeStart, "milliseconds.");
        });

    });

}



//instert();

//profiler

for(var i = 0; i <= 500; i++) {
   aggregated(i);
}







