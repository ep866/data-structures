var fs = require("fs");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var date = require("date-and-time");

var data = {
    readFile: function(file, cb) {
        var content = fs.readFileSync(file);

        return cb(JSON.parse(content));
    }
};

//*******************************************
// DB stuff
//*******************************************
var collectionName = "meetings";
var dbName = "AAmeetings";
var url = "mongodb://localhost:27017/" + dbName;

var now = new Date();
var day = date.format(now, 'dddd');
var h = date.format(now, 'H');
var m = date.format(now, 'mm');
if (h < 10) h = "0" + h;
var time = h + ":" + m;

var pipe = [{
    $match: { $and: [
        { day: day },
        { $or:[
         { startTime : {$gte: time} },
         // we have to catch meetings after midnight as well
         { startTime : {$gte: "00:00", $lt: "05:00"} }
    ]}
    ] }},
     { $group: {
        _id: { latLong: "$latLong", location: "$location", formattedLocation: "$formattedLocation",locationNotes: "$locationNotes"},
        meetings: {
            $push: {
                group: "$group",
                type: "$type",
                startTime: "$startTime",
                endTime: "$endTime"
      }} } }
    // this is for debugging
     // { $group: { _id: "$startTime", count: { $sum: 1 } } },
     // { $sort : { _id: 1 } }
];


var collection;
var database;

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    collection = db.collection(collectionName);
    database = db;

    // collection.aggregate(pipe).toArray(function(err, docs) {
    //         if(err) { console.log(err); }
    //         var result = docs;

    //         console.log(result);

    //     });


    // profiler.singleConnection(25);
    // profiler.singleConnection(50);
    profiler.concurrent(50);

});

//*******************************************
// Profiler
//*******************************************

var profiler = {
    start: function(){
        // result = [];
        return new Date();
    },

    result: [],

    measure: function(testId, start) {
        //JSON
        profiler.result.push({
            id: testId,
            time: new Date() - start
        });
    },

    when: function(){
      var args = arguments;
      return {
        then: function(done) {
          var counter = 0;
          for(var i = 0; i < args.length; i++) {
            args[i](function() {
              counter++;
              if(counter === args.length) {
                done();
              }
            });
          }
        }
      };
    },

    concurrent:function(nIterations, testType) {
        var testType = testType || "concurrent";
        var testId = 0;
        var start = profiler.start();

        function runtest() {

            profiler.when(function(done){
                collection.aggregate(pipe).toArray(function(err, docs) {
                    if(err) { console.log(err); }
                    var result = docs;

                    // console.log(result);
                    profiler.measure(testId, start);
                    console.log("res", profiler.result);
                    profiler.output(nIterations, testType);
            });
            done();
            }, function(done){
                //console.log("Start", testId);

                testId++;
                done();
            }).then(function(){

                if( testId == nIterations ) {
                    return
                }
                runtest();
            });
        }
        runtest();

        database.close();

    },

    singleConnection: function (nIterations, testType) {
        var testType = testType || "single";

        var testId = 1;

        var runTest = function() {
            var start = profiler.start();

            if(testId == (nIterations+1))  {
                console.log("Test finished!");
                database.close();
                profiler.output(nIterations, testType);
                return;
            } else {
                console.log("Running test N: ", testId);

                collection.aggregate(pipe).toArray(function(err, docs) {
                    if(err) { console.log(err); }
                    var result = docs;

                    console.log(result);

                    profiler.measure(testId, start);
                    testId++;
                    runTest();
                });
            }
        }

        runTest();


        // function runtest() {

        //     profiler.when(function(done){
        //         db.aggregate(testId, nIterations);
        //         done();
        //     }, function(done){
        //         //console.log("Start", testId);
        //         testId++;
        //         done();
        //     }).then(function(){

        //         profiler.measure(testId, start);

        //         if( testId == nIterations ) {
        //             profiler.output(nIterations);
        //             return
        //         }
        //         runtest();
        //     });
        // }


    },
    output: function(nIterations, testType) {
        console.log("******************************************");
        console.log(profiler.result);
        console.log("******************************************");
        // write file
        fs.writeFileSync('./profiler/'+testType+'/test_' + nIterations + '_times.json', JSON.stringify(profiler.result, null, 2) , 'utf-8');

    }

};


//*******************************************
// this will output the aggregated result
// type in 25 to have it run 25 times
// it will write a file in the profiler/ folder
// it will also print the result of the last call in the console
//*******************************************






