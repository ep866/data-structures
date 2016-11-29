var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;

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

var db = {
    insert: function(data) {
        // console.log(data.length);

        // connect
        MongoClient.connect(url, function(err, db){
            if(err) { return console.log(err); }

            var collection = db.collection(collectionName);

            //drop old
            collection.drop();

            // insert
            data.forEach(function(meeting, i){
                collection.insert( meeting );
            });

            //check
            console.log( collection.find().count() );

            db.close();
        });
    }
};

data.readFile("processed_data/db_collection.json", function(meetings){

    //*******************************************
    // Now insert the formatted meetings into the DB
    //*******************************************

    // db.insert(meetings);

});







